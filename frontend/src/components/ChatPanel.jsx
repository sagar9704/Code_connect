// src/components/ChatPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import ably from "../realtime/ablyClient";
import { Mic, MicOff, Send } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// 👇 small helper to build one channel per room
function channelNameForRoom(roomId) {
  return `codeconnect:room:${roomId}:chat`;
}

export default function ChatPanel({ roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const channelRef = useRef(null);

  const displayName = user?.displayName || user?.email || "Guest";
  const avatar = user?.photoURL || null;

  // 🔁 Subscribe to Ably channel for this room
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    if (!ably) {
      console.error("Ably client not initialised");
      return;
    }

    const chanName = channelNameForRoom(roomId);
    console.log("🔗 Subscribing to Ably channel:", chanName);

    const channel = ably.channels.get(chanName);
    channelRef.current = channel;

    // load last 50 messages from history (optional)
    channel.history({ direction: "forwards", limit: 50 }, (err, page) => {
      if (err) {
        console.error("Ably history error:", err);
        return;
      }
      const historyMessages = page.items
        .map((msg) => msg.data)
        .filter(Boolean);
      setMessages(historyMessages);
    });

    // realtime subscription
    const listener = (msg) => {
      if (!msg.data) return;
      setMessages((prev) => [...prev, msg.data]);
    };

    channel.subscribe("chat-message", listener);

    return () => {
      console.log("🧹 Unsubscribing from Ably channel:", chanName);
      channel.unsubscribe("chat-message", listener);
      channelRef.current = null;
    };
  }, [roomId]);

  // ✅ send on Enter
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  }

  async function sendTextMessage() {
    if (!roomId || !text.trim()) return;

    const channel = channelRef.current;
    if (!channel) {
      console.warn("No Ably channel yet, cannot send");
      return;
    }

    const payload = {
      type: "text",
      text: text.trim(),
      sender: displayName,
      avatar,
      roomId,
      createdAt: Date.now(),
    };

    console.log("📤 Publishing text chat message:", payload);

    try {
      await channel.publish("chat-message", payload);
      setText("");
    } catch (err) {
      console.error("Ably publish error (text):", err);
      alert("Failed to send message.");
    }
  }

  // 🎙️ Voice recording → Firebase Storage, URL via Ably
  async function startRecording() {
    if (!roomId || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());

        const fileName = `${roomId}-${Date.now()}.webm`;
        const voiceRef = ref(storage, `voice/${roomId}/${fileName}`);
        await uploadBytes(voiceRef, blob);
        const url = await getDownloadURL(voiceRef);

        const channel = channelRef.current;
        if (!channel) return;

        const payload = {
          type: "voice",
          audioUrl: url,
          sender: displayName,
          avatar,
          roomId,
          createdAt: Date.now(),
        };

        console.log("📤 Publishing voice chat message:", payload);

        try {
          await channel.publish("chat-message", payload);
        } catch (err) {
          console.error("Ably publish error (voice):", err);
          alert("Failed to send voice message.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Unable to access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  function renderMessage(m, idx) {
    const isMine = m.sender === displayName;

    return (
      <div
        key={m.id || idx}
        style={{
          marginBottom: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: isMine ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexDirection: isMine ? "row-reverse" : "row",
          }}
        >
          {m.avatar ? (
            <img
              src={m.avatar}
              alt={m.sender}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: isMine ? "#059669" : "#4f46e5",
                color: "white",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {(m.sender || "G")[0].toUpperCase()}
            </div>
          )}

          <div
            style={{
              maxWidth: 220,
              borderRadius: 10,
              padding: "4px 8px",
              fontSize: 11,
              background: isMine ? "#4f46e5" : "#020617",
              color: isMine ? "#f9fafb" : "#e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: 10,
                opacity: 0.8,
                marginBottom: 2,
              }}
            >
              {m.sender || "Guest"}
            </div>

            {m.type === "text" && (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {m.text}
              </div>
            )}

            {m.type === "voice" && m.audioUrl && (
              <audio
                controls
                src={m.audioUrl}
                style={{ width: "100%", marginTop: 4 }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="terminal-chat-wrapper">
        <div className="small muted">
          Join or create a room to use chat.
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-chat-wrapper">
      {/* Header row: title + mic button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
          }}
        >
          Room chat
        </span>
        <button
          type="button"
          className="btn outline"
          style={{
            padding: 2,
            width: 28,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={toggleRecording}
          title={isRecording ? "Stop recording" : "Record voice message"}
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
      </div>

      {/* Messages list */}
      <div
        style={{
          maxHeight: 120,
          overflowY: "auto",
          marginBottom: 4,
        }}
      >
        {messages.length === 0 ? (
          <div className="small muted">No messages yet. Say hi 👋</div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input
          type="text"
          className="field-input"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ fontSize: 12, padding: "4px 6px" }}
        />
        <button
          type="button"
          className="btn outline"
          onClick={sendTextMessage}
          disabled={!text.trim()}
          style={{ padding: "4px 6px", fontSize: 11 }}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
