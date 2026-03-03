// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style.css";
import logo from "../assets/codeconnect.png";
import { useAuth } from "../styles/context/AuthContext";

export default function Landing() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  const {
    user,
    authLoading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const navigate = useNavigate();

  function generateRoomId() {
    const id = Math.random().toString(36).slice(2, 10);
    setRoomId(id);
    return id;
  }

  function handleSubmit(e) {
    e.preventDefault();

    // 🔒 hard block: must be logged in
    if (!user) {
      setAuthError("Please sign in before entering a room.");
      return;
    }

    const typedId = roomId.trim();
    const id = typedId || generateRoomId();
    const cleanId = id.trim();

    const query = roomName
      ? `?name=${encodeURIComponent(roomName.trim())}`
      : "";
    navigate(`/room/${encodeURIComponent(cleanId)}${query}`);
  }

  async function handleGoogleLogin() {
    try {
      setAuthError("");
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Google login failed");
    }
  }

  async function handleEmailLogin() {
    try {
      setAuthError("");
      if (!email || !password) {
        setAuthError("Enter email and password.");
        return;
      }
      await loginWithEmail(email, password);
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Email login failed");
    }
  }

  async function handleEmailRegister() {
    try {
      setAuthError("");
      if (!email || !password) {
        setAuthError("Enter email and password to register.");
        return;
      }
      await registerWithEmail(email, password);
      setAuthError("Account created! You can now log in.");
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Registration failed");
    }
  }

  function openCreateJoinModal() {
    if (!user) {
      setAuthError("Please sign in before creating or joining a room.");
      return;
    }
    setCreateRoomOpen(true);
  }

  return (
    // Force light, Jupyter-like theme only on landing
    <div className="page-wrapper theme-light">
      {/* === Top bar (Jupyter-style) === */}
      <div className="topbar">
        <div className="left-side">
          <div className="landing-logo-circle">
            <img src={logo} alt="CodeConnect" className="landing-logo-img" />
          </div>
          <div>
            <div className="brand-title">CodeConnect Notebook</div>
            <div className="brand-subtitle">
              Browser-based collaborative code notebooks.
            </div>
          </div>
        </div>

        <div className="right-side">
          <div className="landing-tools-strip">
            <span className="tools-label">Works great with</span>
            <span className="tools-pill">C / C++</span>
            <span className="tools-pill">Java</span>
            <span className="tools-pill">Python</span>
            <span className="tools-pill">JavaScript</span>
          </div>

          <button
            className="btn outline"
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{ marginLeft: 8 }}
          >
            Open Dashboard
          </button>

          {/* Auth status in top-right */}
          {!authLoading && (
            <div
              style={{
                marginLeft: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {user ? (
                <>
                  <span className="small muted">
                    {user.displayName || user.email || "User"}
                  </span>
                  <button className="btn outline" type="button" onClick={logout}>
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  className="btn outline"
                  type="button"
                  onClick={handleGoogleLogin}
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === Centered hero + sliding window (like video) === */}
      <div className="landing-hero-center">
        <h1 className="landing-hero-title">
          Code together,
          <br />
          in one live notebook.
        </h1>
        <p className="landing-hero-text">
          CodeConnect is a real-time collaborative coding space. Create a room,
          share the link, and everyone sees the same editor and terminal.
        </p>

        {/* Auth card below hero */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.4)",
            maxWidth: 420,
            width: "100%",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          {authLoading ? (
            <p className="small muted">Checking sign-in status…</p>
          ) : user ? (
            <p className="small muted">
              Signed in as{" "}
              <strong>{user.displayName || user.email || "User"}</strong>.
              You can now create or join a shared room below, and your cloud
              snippets will be linked to this account.
            </p>
          ) : (
            <>
              <button
                className="landing-cta-btn"
                type="button"
                onClick={handleGoogleLogin}
                style={{ width: "100%", marginBottom: 8 }}
              >
                Continue with Google
              </button>

              <p className="small muted" style={{ marginBottom: 6 }}>
                Or sign in with email:
              </p>

              <input
                className="field-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 6 }}
              />
              <input
                className="field-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn outline"
                  onClick={handleEmailLogin}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleEmailRegister}
                >
                  Register
                </button>
              </div>
            </>
          )}

          {authError && (
            <p
              className="small"
              style={{ marginTop: 8, color: "#b91c1c", fontWeight: 500 }}
            >
              {authError}
            </p>
          )}
        </div>

        {/* Sliding window (unchanged) */}
        <div className="landing-slider-window">
          <div className="landing-slider-track">
            <div className="landing-feature-card">
              <h3>Real-time editor</h3>
              <p>
                Multiple people type in the same file. Changes sync instantly
                across everyone in the room.
              </p>
            </div>

            <div className="landing-feature-card">
              <h3>Shared terminal</h3>
              <p>
                Run C, C++, Java, Python, or JavaScript and share one output
                window with the whole team.
              </p>
            </div>

            <div className="landing-feature-card">
              <h3>Save & share snippets</h3>
              <p>
                Download files, save to local or cloud, and share via WhatsApp,
                Gmail, or GitHub Gist directly.
              </p>
            </div>

            <div className="landing-feature-card">
              <h3>No setup required</h3>
              <p>
                Everything runs in the browser. No IDE installs, no plugins –
                just open a link and start coding.
              </p>
            </div>
          </div>
        </div>

        {/* Big center button (Create / Join Room) */}
        <button
          className="landing-cta-btn"
          type="button"
          onClick={openCreateJoinModal}
        >
          Create / Join Room
        </button>

        <p className="small muted" style={{ marginTop: 8 }}>
          Sign in first, then create a shared room. Share the URL and anyone on
          the same link joins the same CodeConnect room.
        </p>
      </div>

      {/* === Modal: Create / Join form (unchanged logic, but now guarded) === */}
      {createRoomOpen && (
        <div className="modal-backdrop">
          <div className="create-room-modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h3 style={{ margin: 0 }}>Create / Join a Room</h3>
              <button
                type="button"
                className="btn outline"
                onClick={() => setCreateRoomOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Room name (optional)</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. DSA Lab, OS Assignment..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">
                  Room ID <span className="small muted">(auto if empty)</span>
                </label>
                <div className="field-inline">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="auto-generate"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn outline"
                    onClick={generateRoomId}
                  >
                    Generate
                  </button>
                </div>
              </div>

              <button
                className="landing-cta-btn"
                type="submit"
                style={{ width: "100%", marginTop: 14 }}
              >
                Enter Code Room
              </button>

              <p className="small muted" style={{ marginTop: 8 }}>
                After entering, just share the browser URL. Anyone on the same
                link joins the same CodeConnect room.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
