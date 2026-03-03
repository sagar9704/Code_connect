// src/components/CodeCraftUI.jsx
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Play,
  Moon,
  Sun,
  Share2,
  ZoomIn,
  ZoomOut,
  Save,
  X,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/codeconnect.png";
import "../styles/style.css";
import { saveSnippetToCloud, getSnippetById } from "../firebase";
import ChatPanel from "./ChatPanel";
import { useAuth } from "../styles/context/AuthContext";


const WS_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? `ws://localhost:4000/ws`
    : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;

const COLLAB_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? `ws://localhost:4000/collab`
    : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/collab`;

export default function CodeCraftUI() {
  const { room: activeRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const displayName = (searchParams.get("name") || "").trim();

  const roomIdCanonical = (activeRoomId || "").trim();
  const snippetId = (searchParams.get("snippet") || "").trim();

  const defaultCodeValue = `#include <iostream>\nint main(){ std::cout << "Hello"; return 0; }`;

  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(defaultCodeValue);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const wsRef = useRef(null);
  const outputRef = useRef(null);
  const collabRef = useRef(null);
const { user } = useAuth();

  // unique id per browser + room
  const clientIdRef = useRef(
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );

  const [isRoomOwner, setIsRoomOwner] = useState(false);

  // participants with lastSeen
  const [participants, setParticipants] = useState([]);

  // tabs state
  const [tabs, setTabs] = useState(() => [
    { id: 1, name: "Untitled-1", code: defaultCodeValue },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextUntitledIndex, setNextUntitledIndex] = useState(2);

  const [showShareMenu, setShowShareMenu] = useState(false);

  // font / zoom
  const defaultFont = 15;
  const [fontSize, setFontSize] = useState(defaultFont);
  const minFont = 11;
  const maxFont = 28;
  const zoomIn = () => setFontSize((s) => Math.min(maxFont, s + 1));
  const zoomOut = () => setFontSize((s) => Math.max(minFont, s - 1));
  const resetZoom = () => setFontSize(defaultFont);

  // monaco
  const [MonacoComp, setMonacoComp] = useState(null);
  const [monacoReady, setMonacoReady] = useState(false);

  // keep body background in sync with theme
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor =
      theme === "light" ? "#e6f0ff" : "#020617";
    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, [theme]);

  // --- helpers ---
  function broadcastCollab(msg) {
    const ws = collabRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !roomIdCanonical) return;
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {}
  }

  function upsertParticipant(p) {
    setParticipants((prev) => {
      const idx = prev.findIndex((x) => x.clientId === p.clientId);
      const now = Date.now();
      const withTimestamp = { lastSeen: now, ...p };
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...withTimestamp };
        return copy;
      }
      return [...prev, withTimestamp];
    });
  }

  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.clientId !== id));
  }

  // update tabs + active + nextUntitledIndex, and optionally broadcast full tabs_state
  function setTabsAndActive(newTabs, newActiveId, fromRemote = false) {
    setTabs(newTabs);
    setActiveTabId(newActiveId);

    const maxUntitled = newTabs
      .map((t) => {
        const m = /^Untitled-(\d+)$/.exec(t.name || "");
        return m ? parseInt(m[1], 10) : 1;
      })
      .reduce((a, b) => Math.max(a, b), 1);
    setNextUntitledIndex(maxUntitled + 1);

    if (!fromRemote) {
      broadcastCollab({
        type: "tabs_state",
        tabs: newTabs,
        activeTabId: newActiveId,
      });
    }
  }

  /**
   * Core tab-code update function.
   * - If tabIdOverride given, update that tab.
   * - Otherwise update current activeTabId.
   * - Broadcast a { type:"code", tabId, code } message (except when fromRemote).
   */
  function applyCodeToActiveTab(
    newCode,
    fromRemote = false,
    tabIdOverride = null
  ) {
    const targetTabId = tabIdOverride ?? activeTabId;
    if (!targetTabId) return;

    setTabs((prev) => {
      const updated = prev.map((tab) =>
        tab.id === targetTabId ? { ...tab, code: newCode } : tab
      );

      if (!fromRemote) {
        broadcastCollab({
          type: "code",
          tabId: targetTabId,
          code: newCode,
        });
      }

      return updated;
    });

    // Only update visible editor content if we're editing that tab
    if (targetTabId === activeTabId) {
      setCode(newCode);
    }
  }

  // discover room owner (admin) from localStorage
  useEffect(() => {
    if (!roomIdCanonical) return;
    try {
      const val = localStorage.getItem(`cc_room_owner_${roomIdCanonical}`);
      setIsRoomOwner(!!val);
    } catch (e) {}
  }, [roomIdCanonical]);

  // load snippet from cloud if snippetId present
  useEffect(() => {
    if (!snippetId) return;
    (async () => {
      try {
        const data = await getSnippetById(snippetId);
        if (!data) return;
        if (data.language) setLanguage(data.language);
        if (typeof data.code === "string") {
          // apply to current active tab, broadcast to room
          applyCodeToActiveTab(data.code, false);
        }
      } catch (e) {
        console.error("Failed to load snippet from cloud", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippetId]);

  // collab WebSocket (code + presence + tabs)
  useEffect(() => {
    if (!roomIdCanonical) return;

    const ws = new WebSocket(
      `${COLLAB_URL}?room=${encodeURIComponent(roomIdCanonical)}`
    );
    collabRef.current = ws;

    ws.onopen = () => {
      // send our tabs + language
      broadcastCollab({
        type: "tabs_state",
        tabs,
        activeTabId,
      });
      broadcastCollab({
        type: "language",
        language,
      });

      // send presence
      const me = {
        clientId: clientIdRef.current,
        name: displayName || "Guest",
        isOwner: isRoomOwner,
      };
      upsertParticipant(me);
      broadcastCollab({
        type: "presence_join",
        ...me,
      });
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "code" && typeof msg.code === "string") {
        // NEW: update the tab that actually changed
        const tabId = msg.tabId;
        if (typeof tabId === "number") {
          applyCodeToActiveTab(msg.code, true, tabId);
        } else {
          // fallback to old behaviour if tabId missing
          applyCodeToActiveTab(msg.code, true);
        }
      } else if (msg.type === "terminal" && typeof msg.data === "string") {
        appendOutput(msg.data, true);
      } else if (msg.type === "terminal_clear") {
        setOutput("");
      } else if (
        msg.type === "tabs_state" &&
        Array.isArray(msg.tabs) &&
        msg.tabs.length > 0
      ) {
        const incomingTabs = msg.tabs;
        const incomingActive =
          msg.activeTabId ?? incomingTabs[0]?.id ?? activeTabId;

        setTabsAndActive(incomingTabs, incomingActive, true);

        // set editor code to active tab's code
        const activeTab = incomingTabs.find((t) => t.id === incomingActive);
        const newCode = activeTab?.code || "";
        setCode(newCode);
      } else if (msg.type === "language" && typeof msg.language === "string") {
        setLanguage(msg.language);
      } else if (msg.type === "presence_join" && msg.clientId) {
        upsertParticipant({
          clientId: msg.clientId,
          name: msg.name || "Guest",
          isOwner: !!msg.isOwner,
        });

        if (msg.clientId !== clientIdRef.current) {
          const me = {
            clientId: clientIdRef.current,
            name: displayName || "Guest",
            isOwner: isRoomOwner,
          };
          upsertParticipant(me);
          broadcastCollab({
            type: "presence_join",
            ...me,
          });
        }
      } else if (msg.type === "presence_ping" && msg.clientId) {
        upsertParticipant({
          clientId: msg.clientId,
          name: msg.name || "Guest",
          isOwner: !!msg.isOwner,
        });
      } else if (msg.type === "presence_leave" && msg.clientId) {
        removeParticipant(msg.clientId);
      }
    };

    ws.onclose = () => {
      if (collabRef.current === ws) collabRef.current = null;
    };

    return () => {
      try {
        ws.close();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdCanonical]);

  // presence pings every 4s
  useEffect(() => {
    if (!roomIdCanonical) return;
    const interval = setInterval(() => {
      const me = {
        clientId: clientIdRef.current,
        name: displayName || "Guest",
        isOwner: isRoomOwner,
      };
      upsertParticipant(me);
      broadcastCollab({
        type: "presence_ping",
        ...me,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [roomIdCanonical, displayName, isRoomOwner]);

  // presence cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - 8000;
      setParticipants((prev) =>
        prev.filter((p) => (p.lastSeen || 0) > cutoff)
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // send presence_leave on unload
  useEffect(() => {
    if (!roomIdCanonical) return;
    const handleUnload = () => {
      broadcastCollab({
        type: "presence_leave",
        clientId: clientIdRef.current,
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      broadcastCollab({
        type: "presence_leave",
        clientId: clientIdRef.current,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdCanonical]);

  // terminal output helpers
  function appendOutput(text, fromRemote = false) {
    setOutput((prev) => {
      const next = prev + text;
      requestAnimationFrame(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      });
      return next;
    });
    if (!fromRemote) {
      broadcastCollab({ type: "terminal", data: text });
    }
  }

  function finishSession() {
    setRunning(false);
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
  }

  function startInteractive() {
    if (running) return;
    setOutput("");
    broadcastCollab({ type: "terminal_clear" });
    setRunning(true);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "start", language, code }));
    };

    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (msg.type === "stdout" || msg.type === "stderr")
        appendOutput(msg.data || "");
      else if (msg.type === "compile") {
        if (!msg.ok) {
          appendOutput(
            "Compilation error:\n" + (msg.stderr || "see stderr") + "\n"
          );
          finishSession();
        } else appendOutput("Compilation OK — starting program...\n");
      } else if (msg.type === "started") appendOutput("Process started.\n");
      else if (msg.type === "exit") {
        appendOutput(`\n[Process exited with code ${msg.code}]\n`);
        finishSession();
      } else if (msg.type === "killed") {
        appendOutput("\n[Process killed]\n");
        finishSession();
      } else if (msg.type === "error")
        appendOutput("ERROR: " + (msg.error || "") + "\n");
    };

    ws.onclose = () => finishSession();
    ws.onerror = () => {
      appendOutput("WebSocket error.\n");
      finishSession();
    };
  }

  function sendStdin(text) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      appendOutput("[Not connected]\n");
      return;
    }
    wsRef.current.send(JSON.stringify({ type: "stdin", data: text }));
  }

  function killProcess() {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      appendOutput("[No running process]\n");
      return;
    }
    wsRef.current.send(JSON.stringify({ type: "kill" }));
  }

  // share / save helpers
  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  const whatsappShare = () =>
    `https://wa.me/?text=${encodeURIComponent(
      "Code snippet from CodeConnect:\n\n" + code
    )}`;

  const githubGistLink = () =>
    `https://gist.github.com/?file=${encodeURIComponent(
      "snippet.txt"
    )}&content=${encodeURIComponent(code)}`;

  const gmailShareLink = () => {
    const subject = "CodeConnect snippet";
    const body = `Here is a code snippet from CodeConnect:\n\n${code}\n\nRoom link: ${window.location.href}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  function handleShare() {
    const link = window.location.href;
    const text = `Join my CodeConnect room:\n${link}\n\nCode:\n${code}`;
    copyToClipboard(text);
    alert("Room link + code copied to clipboard.");
  }

  function handleSaveSnippet() {
    const defaultName =
      (roomIdCanonical && `Room_${roomIdCanonical}`) || "snippet";

    const name = window.prompt("Enter snippet name", defaultName);
    if (!name) return;

    const choice = window.prompt(
      "Choose an option:\n" +
        "1 - Download file\n" +
        "2 - Save to local storage\n" +
        "3 - Save to cloud (Dashboard)\n" +
        "4 - Share via WhatsApp\n" +
        "5 - Share via Gmail\n" +
        "6 - Share via GitHub Gist\n" +
        "Cancel / empty = Do nothing"
    );

    if (!choice) return;

    const doDownload = () => {
      try {
        const extMap = {
          cpp: "cpp",
          c: "c",
          java: "java",
          python: "py",
          javascript: "js",
        };
        const ext = extMap[language] || "txt";

        const fileName = `${name.replace(/\s+/g, "_")}.${ext}`;
        const blob = new Blob([code], {
          type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert("File downloaded.");
      } catch (e) {
        console.error(e);
        alert("Download failed.");
      }
    };

    const doLocalSave = () => {
      try {
        const key = "cc_snippets_v1";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const id = Date.now();
        const snippet = {
          id,
          name,
          language,
          code,
          roomId: roomIdCanonical || null,
          createdAt: new Date().toISOString(),
        };
        existing.push(snippet);
        localStorage.setItem(key, JSON.stringify(existing));
        alert("Snippet saved in local storage.");
      } catch (e) {
        console.error(e);
        alert("Could not save snippet (localStorage error).");
      }
    };

    const doCloudSave = async () => {
      try {
        const saved = await saveSnippetToCloud({
          name,
          language,
          code,
          roomId: roomIdCanonical || null,
        });
        console.log("Saved snippet to cloud:", saved);
        alert("Snippet saved to cloud for Dashboard.");
      } catch (e) {
        console.error(e);
        alert("Could not save snippet to cloud.");
      }
    };

    if (choice === "1") {
      doDownload();
    } else if (choice === "2") {
      doLocalSave();
    } else if (choice === "3") {
      doCloudSave();
    } else if (choice === "4") {
      window.open(whatsappShare(), "_blank");
    } else if (choice === "5") {
      window.open(gmailShareLink(), "_blank");
    } else if (choice === "6") {
      window.open(githubGistLink(), "_blank");
    } else {
      alert("Unknown option.");
    }
  }

  // tab actions
  function handleTabClick(id) {
    if (id === activeTabId) return;
    const targetTab = tabs.find((t) => t.id === id);
    const newCode = targetTab?.code || "";
    setTabsAndActive(tabs, id, false);
    setCode(newCode);
  }

  function handleAddTab() {
    const newId = Date.now();
    const newName = `Untitled-${nextUntitledIndex}`;
    const newTabs = [...tabs, { id: newId, name: newName, code: "" }];
    const newActiveId = newId;
    setNextUntitledIndex((n) => n + 1);

    // broadcast new tabs structure
    setTabsAndActive(newTabs, newActiveId, false);
    // local editor blank for this new tab
    setCode("");
  }

  function handleRenameTab() {
    const current = tabs.find((t) => t.id === activeTabId);
    const currentName = current?.name || "";
    const newName = window.prompt("Enter new name for this tab", currentName);
    if (!newName) return;
    const newTabs = tabs.map((t) =>
      t.id === activeTabId ? { ...t, name: newName } : t
    );
    setTabsAndActive(newTabs, activeTabId, false);
  }

  function handleCopyAll() {
    copyToClipboard(code);
    alert("Code copied to clipboard.");
  }

  function handleCutAll() {
    copyToClipboard(code);
    applyCodeToActiveTab("", false);
  }

  async function handlePasteFromClipboard() {
    if (!navigator.clipboard?.readText) {
      alert("Clipboard API not available, please use Ctrl+V.");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      const newCode = code ? code + "\n" + text : text;
      applyCodeToActiveTab(newCode, false);
    } catch (e) {
      console.error(e);
      alert("Could not paste from clipboard.");
    }
  }

  function handleDeleteAll() {
    if (!window.confirm("Clear the entire editor?")) return;
    applyCodeToActiveTab("", false);
  }

  // stdin
  const [stdin, setStdin] = useState("");
  function onStdinKeyDown(e) {
    if (e.key === "Enter") {
      sendStdin(stdin + "\n");
      setStdin("");
    }
  }

  // room modal
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomIdState] = useState("");

  function generateRoomId() {
    const id = Math.random().toString(36).slice(2, 10);
    setRoomIdState(id);
    return id;
  }

  function openCreateRoom() {
    setRoomName("");
    setRoomIdState("");
    setCreateRoomOpen(true);
  }

  function joinRoom() {
    const rawId = roomId.trim() || generateRoomId();
    const cleanId = rawId.trim();
    const cleanName = roomName.trim();

    try {
      localStorage.setItem(`cc_room_owner_${cleanId}`, "1");
    } catch (e) {}

    const target = `${location.origin}/room/${encodeURIComponent(cleanId)}${
      cleanName ? `?name=${encodeURIComponent(cleanName)}` : ""
    }`;
    window.location.href = target;
  }

  // leave room: presence_leave + redirect to landing
  function handleLeaveRoom() {
    const id = clientIdRef.current;
    removeParticipant(id);

    broadcastCollab({
      type: "presence_leave",
      clientId: id,
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    broadcastCollab({ type: "language", language: newLang });
  }
  return (
    <div className={`page-wrapper ${theme === "light" ? "theme-light" : ""}`}>
      {/* Top bar */}
      <div className="topbar">
        <div className="left-side">
          <img src={logo} alt="Logo" className="logo-img" />
          <div>
            <div className="brand-title">CodeConnect</div>
            <div className="brand-subtitle">
              {roomIdCanonical
                ? `Room: ${roomIdCanonical}`
                : "Single user mode"}{" "}
              {displayName ? ` · ${displayName}` : ""}
            </div>
          </div>
        </div>

        <div className="right-side">
          <div className="lang-theme-box">
            <select value={language} onChange={handleLanguageChange}>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button
              className="theme-toggle btn outline"
              onClick={() =>
                setTheme((t) => (t === "dark" ? "light" : "dark"))
              }
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {roomIdCanonical && (
            <button className="btn outline" onClick={handleLeaveRoom}>
              Leave Room
            </button>
          )}

          <button className="btn outline" onClick={openCreateRoom}>
            Create / Join Room
          </button>
        </div>
      </div>

      {/* Main grid: participants | editor | terminal */}
      <div className="editor-grid">
        {/* Participants */}
        <div className="participants-panel">
          <div className="participants-header">
            <Users size={16} style={{ marginRight: 6 }} />
            People
          </div>
          <div className="participants-list">
            {participants.length === 0 ? (
              <div className="participants-empty">Just you in this room</div>
            ) : (
              participants.map((p) => (
                <div key={p.clientId} className="participant-item">
                  <div className="participant-avatar">
                    {(p.name || "G")[0].toUpperCase()}
                  </div>
                  <div className="participant-info">
                    <div className="participant-name">
                      {p.name || "Guest"}
                      {p.clientId === clientIdRef.current && (
                        <span className="participant-tag">you</span>
                      )}
                    </div>
                    <div className="participant-tags">
                      {p.isOwner && (
                        <span className="badge-admin">Admin</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="editor-panel">
          <div className="tab-toolbar-container">
            <div className="tabs-row">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`tab ${tab.id === activeTabId ? "active" : ""}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.name}
                </div>
              ))}
              <div className="tab add-tab-btn" onClick={handleAddTab}>
                +
              </div>
            </div>

            <div className="toolbar-row">
              <button
                className="btn primary"
                onClick={startInteractive}
                disabled={running}
              >
                <Play size={14} style={{ marginRight: 4 }} />
                {running ? "Running..." : "Run"}
              </button>

              <button className="btn" onClick={handleCutAll}>
                Cut
              </button>
              <button className="btn" onClick={handleCopyAll}>
                Copy
              </button>
              <button className="btn" onClick={handlePasteFromClipboard}>
                Paste
              </button>
              <button className="btn" onClick={handleDeleteAll}>
                Delete
              </button>
              <button className="btn" onClick={handleAddTab}>
                New
              </button>
              <button className="btn" onClick={handleRenameTab}>
                Edit
              </button>

              <button className="btn" onClick={handleSaveSnippet}>
                <Save size={14} style={{ marginRight: 4 }} />
                Save
              </button>

              <div className="toolbar-menu-wrapper">
                <button
                  className="btn"
                  type="button"
                  onClick={() => setShowShareMenu((s) => !s)}
                >
                  <Share2 size={14} style={{ marginRight: 4 }} />
                  Share ▼
                </button>
                {showShareMenu && (
                  <div className="toolbar-dropdown">
                    <button
                      type="button"
                      onClick={() => {
                        window.open(whatsappShare(), "_blank");
                        setShowShareMenu(false);
                      }}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open(gmailShareLink(), "_blank");
                        setShowShareMenu(false);
                      }}
                    >
                      Gmail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open(githubGistLink(), "_blank");
                        setShowShareMenu(false);
                      }}
                    >
                      GitHub Gist
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleShare();
                        setShowShareMenu(false);
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>

              <div className="toolbar-spacer" />

              <div className="zoom-controls">
                <button className="zoom-btn" onClick={zoomOut}>
                  <ZoomOut size={16} />
                </button>
                <div className="zoom-label">
                  {Math.round((fontSize / 16) * 100)}%
                </div>
                <button className="zoom-btn" onClick={zoomIn}>
                  <ZoomIn size={16} />
                </button>
                <button className="zoom-reset" onClick={resetZoom}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="editor-body" style={{ fontSize: `${fontSize}px` }}>
            {monacoReady && MonacoComp ? (
              <Suspense
                fallback={
                  <textarea
                    className="code-area"
                    value={code}
                    onChange={(e) => applyCodeToActiveTab(e.target.value)}
                  />
                }
              >
                <MonacoComp
                  height="420px"
                  defaultLanguage={language === "cpp" ? "cpp" : language}
                  language={language === "cpp" ? "cpp" : language}
                  value={code}
                  onChange={(v) => applyCodeToActiveTab(v || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize,
                    folding: true,
                    smoothScrolling: true,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </Suspense>
            ) : (
              <textarea
                className="code-area"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
                value={code}
                onChange={(e) => applyCodeToActiveTab(e.target.value)}
              />
            )}
          </div>

          <div className="editor-tip">
            Tip: Run opens an interactive session (uses backend runner). Use the
            terminal below to send input.
          </div>
        </div>

        {/* Terminal */}
        <div className="terminal-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span style={{ marginLeft: 8 }}>Terminal</span>
            </div>
            <div className="panel-actions">
              <button
                className="btn outline small"
                onClick={() => setOutput("")}
              >
                Clear
              </button>
              <button className="btn outline small" onClick={killProcess}>
                Kill
              </button>
            </div>
          </div>

          <div className="terminal-body" ref={outputRef}>
            <pre className="terminal-text">
              {output || "Output will appear here..."}
            </pre>
          </div>
<div className="stdin-bar">
  <input
    type="text"
    className="stdin-input"
    placeholder="Type input and press Enter..."
    value={stdin}
    onChange={(e) => setStdin(e.target.value)}
    onKeyDown={onStdinKeyDown}
  />
</div>

{/* 👇 Chat box under the terminal */}
<ChatPanel roomId={roomIdCanonical} user={user} />

        </div>
      </div>

      {/* Create Room modal */}
      <AnimatePresence>
        {createRoomOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="create-room-modal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h3 style={{ margin: 0 }}>Create Room</h3>
                <button
                  className="btn"
                  onClick={() => setCreateRoomOpen(false)}
                >
                  <X size={14} style={{ marginRight: 4 }} />
                  Close
                </button>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="field-label">Room name (optional)</label>
                <input
                  className="field-input"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. OS Lab, CP Club..."
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="field-label">
                  Room ID{" "}
                  <span className="small muted">(auto if empty)</span>
                </label>
                <div className="field-inline">
                  <input
                    className="field-input"
                    value={roomId}
                    onChange={(e) => setRoomIdState(e.target.value)}
                    placeholder="auto-generate"
                  />
                  <button
                    className="btn"
                    type="button"
                    onClick={() => generateRoomId()}
                  >
                    Generate
                  </button>
                  <a
                    style={{
                      cursor: "pointer",
                      color: "var(--accent)",
                      marginLeft: 6,
                    }}
                    onClick={() => generateRoomId()}
                  >
                    generate room id
                  </a>
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Share this room id / URL with your collaborators — they'll
                  join the same room URL.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <button
                  className="btn ghost"
                  onClick={() => setCreateRoomOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn primary" onClick={joinRoom}>
                  Join Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
