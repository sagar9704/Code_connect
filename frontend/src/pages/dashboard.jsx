// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentSnippets } from "../firebase";

/**
 * Dashboard
 * - Shows recent snippets saved to Firebase ("cloud")
 * - Each item links back to the CodeConnect room with ?snippet=<id>
 * - CodeCraftUI will then load that snippet and reuse the code
 */
export default function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const list = await getRecentSnippets();
        if (!mounted) return;
        setSnippets(list);
      } catch (e) {
        console.error("Failed to load cloud snippets", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Dashboard · Recent Codes</h2>
        <p className="dashboard-subtitle">
          Snippets saved to cloud from any room. Click one to reopen the room
          with the same code.
        </p>
      </div>

      {loading && <p>Loading snippets...</p>}

      {!loading && snippets.length === 0 && (
        <p>No cloud snippets yet. Go to a room, click Save, and choose option 3 (Save to cloud).</p>
      )}

      {!loading && snippets.length > 0 && (
        <ul className="snippet-list">
          {snippets.map((s) => {
            const roomId = s.roomId || "single";
            const created =
              s.createdAt &&
              !Number.isNaN(Date.parse(s.createdAt))
                ? new Date(s.createdAt).toLocaleString()
                : "";

            return (
              <li key={s.id} className="snippet-item">
                <Link
                  to={`/room/${encodeURIComponent(roomId)}?snippet=${s.id}`}
                  className="snippet-link"
                >
                  <div className="snippet-main">
                    <div className="snippet-name">
                      {s.name || `Room ${roomId}`}
                    </div>
                    <div className="snippet-meta">
                      <span className="snippet-lang">
                        {s.language || "unknown"}
                      </span>
                      {roomId !== "single" && (
                        <span className="snippet-room">Room: {roomId}</span>
                      )}
                      {created && (
                        <span className="snippet-date">{created}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
