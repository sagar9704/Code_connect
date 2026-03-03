// server.js
// Local code-runner backend (express + ws) with manual upgrade routing.
// Supports: C, C++, Java, Python, JavaScript.
// Streams stdout/stderr over WebSocket & supports interactive stdin.

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { v4: uuid } = require("uuid");
const cors = require("cors");


// Use absolute paths for Java tools on Windows to avoid PATH issues
const JAVAC = process.platform === "win32"
  ? "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.17.10-hotspot\\bin\\javac.exe"
  : "javac";

const JAVA = process.platform === "win32"
  ? "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.17.10-hotspot\\bin\\java.exe"
  : "java";


const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());

const server = http.createServer(app);

// ---------- WebSocket servers in noServer mode ----------
const runnerWSS = new WebSocket.Server({ noServer: true });   // /ws
const collabWSS = new WebSocket.Server({ noServer: true });   // /collab

// Single upgrade handler – routes to runner or collab based on path
server.on("upgrade", (req, socket, head) => {
  let pathname = "/";
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    pathname = url.pathname;
  } catch (e) {
    socket.destroy();
    return;
  }

  if (pathname === "/ws") {
    runnerWSS.handleUpgrade(req, socket, head, (ws) => {
      runnerWSS.emit("connection", ws, req);
    });
  } else if (pathname === "/collab") {
    collabWSS.handleUpgrade(req, socket, head, (ws) => {
      collabWSS.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// ---------- helpers for temp dirs & files ----------

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "code-runner-"));
}

function writeFile(dir, filename, content) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}

// try to find Java public class name (simple regex)
function findJavaClassName(code) {
  const re = /public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/;
  const m = re.exec(code);
  if (m) return m[1];
  const re2 = /class\s+([A-Za-z_$][A-Za-z0-9_$]*)/;
  const m2 = re2.exec(code);
  if (m2) return m2[1];
  return "Main";
}

// map language to compile/run steps
function getCommands(language, code) {
  if (language === "c" || language === "cpp") {
    const dir = tmpDir();
    const srcName = language === "c" ? "main.c" : "main.cpp";
    const exeName = process.platform === "win32" ? "a.exe" : "a.out";
    const srcPath = writeFile(dir, srcName, code);
    const exePath = path.join(dir, exeName);

    // NOTE: add -fopenmp so OpenMP functions (omp_set_num_threads, etc.) link correctly
    const compileCmd =
      language === "c"
        ? ["gcc", [srcPath, "-fopenmp", "-o", exePath]]
        : ["g++", [srcPath, "-fopenmp", "-o", exePath]];

    const runCmd = [exePath, []];
    return { dir, compileCmd, runCmd };
  }

if (language === "java") {
  const dir = tmpDir();
  const className = findJavaClassName(code); // "Main" for your program
  const srcPath = writeFile(dir, className + ".java", code);

  const compileCmd = [JAVAC, [srcPath]];
  const runCmd = [JAVA, ["-cp", dir, className]];

  return { dir, compileCmd, runCmd };
}

  
  if (language === "python") {
    const dir = tmpDir();
    const srcPath = writeFile(dir, "main.py", code);
    return { dir, compileCmd: null, runCmd: ["python", [srcPath]] };
  }

  if (language === "javascript") {
    const dir = tmpDir();
    const srcPath = writeFile(dir, "main.js", code);
    return { dir, compileCmd: null, runCmd: ["node", [srcPath]] };
  }

  throw new Error("Unsupported language: " + language);
}

// run a single command, collecting stdout/stderr and streaming back via WebSocket
function runCommand(cmd, args, options, send) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, options);
    let stdout = "";
    let stderr = "";
    let finished = false;

    proc.stdout.on("data", (chunk) => {
      const s = chunk.toString();
      stdout += s;
      send({ type: "stdout", data: s });
    });
    proc.stderr.on("data", (chunk) => {
      const s = chunk.toString();
      stderr += s;
      send({ type: "stderr", data: s });
    });

    proc.on("error", (err) => {
      if (finished) return;
      finished = true;
      send({ type: "error", error: String(err) });
      resolve({ code: -1, stdout, stderr });
    });

    proc.on("close", (code) => {
      if (finished) return;
      finished = true;
      resolve({ code, stdout, stderr });
    });
  });
}

// ---------- collaboration WebSocket (/collab) ----------

const rooms = new Map(); // roomId -> Set<WebSocket>

collabWSS.on("connection", (ws, req) => {
  let roomId = null;
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    roomId = url.searchParams.get("room");
  } catch (e) {
    ws.close();
    return;
  }

  if (!roomId) {
    ws.close();
    return;
  }

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  const set = rooms.get(roomId);
  set.add(ws);

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    for (const client of set) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...msg, roomId }));
      }
    }
  });

  ws.on("close", () => {
    set.delete(ws);
    if (set.size === 0) rooms.delete(roomId);
  });
});

// ---------- runner WebSocket handling (/ws) ----------

runnerWSS.on("connection", (ws) => {
  let currentProc = null;

  function send(msg) {
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      // ignore
    }
  }

  ws.on("message", async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      send({ type: "error", error: "invalid JSON" });
      return;
    }

    if (msg.type === "start") {
      if (currentProc) {
        try {
          currentProc.kill();
        } catch (e) {}
        currentProc = null;
      }
      const lang = msg.language || "cpp";
      const code = msg.code || "";
      let ctx;
      try {
        ctx = getCommands(lang, code);
      } catch (e) {
        send({ type: "error", error: String(e) });
        return;
      }

      const { dir, compileCmd, runCmd } = ctx;

      // compile step (if necessary)
      if (compileCmd) {
        const [cCmd, cArgs] = compileCmd;
        const res = await runCommand(cCmd, cArgs, { cwd: dir }, send);
        if (res.code !== 0) {
          send({
            type: "compile",
            ok: false,
            code: res.code,
            stdout: res.stdout,
            stderr: res.stderr,
          });
          return;
        }
        send({ type: "compile", ok: true, code: res.code });
      }

      // run step
      const [rCmd, rArgs] = runCmd;
      const proc = spawn(rCmd, rArgs, { cwd: dir });
      currentProc = proc;
      send({ type: "started" });

      proc.stdout.on("data", (chunk) => {
        send({ type: "stdout", data: chunk.toString() });
      });
      proc.stderr.on("data", (chunk) => {
        send({ type: "stderr", data: chunk.toString() });
      });

      proc.on("close", (code) => {
        send({ type: "exit", code });
        currentProc = null;
      });
      proc.on("error", (err) => {
        send({ type: "error", error: String(err) });
      });
    } else if (msg.type === "stdin") {
      if (!currentProc) {
        send({ type: "stderr", data: "[No process]\n" });
        return;
      }
      try {
        currentProc.stdin.write(msg.data || "");
      } catch (e) {
        send({ type: "error", error: String(e) });
      }
    } else if (msg.type === "kill") {
      if (!currentProc) {
        send({ type: "stderr", data: "[No process]\n" });
        return;
      }
      try {
        currentProc.kill();
        send({ type: "killed" });
      } catch (e) {
        send({ type: "error", error: String(e) });
      }
    } else {
      send({ type: "error", error: "unknown message type" });
    }
  });

  ws.on("close", () => {
    try {
      if (currentProc) {
        try {
          currentProc.kill();
        } catch (e) {}
        currentProc = null;
      }
    } catch (e) {}
  });
});

// ---------- start server ----------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("Runner listening on :" + PORT);
});
