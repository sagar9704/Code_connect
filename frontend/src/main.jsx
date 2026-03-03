// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import App from "./App"; // wraps CodeCraftUI (code room page)
import Dashboard from "./pages/dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import "./styles/style.css";
import { AuthProvider, useAuth } from "./styles/context/AuthContext";

// Wrapper that forces login
function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="page-wrapper">
        <div className="landing-hero-center">
          <p className="small muted">Checking login…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // send them back to landing, remember where they tried to go
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, requireLogin: true }}
      />
    );
  }

  return children;
}

function Root() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page with login + create/join */}
          <Route path="/" element={<Landing />} />

          {/* Code room: ONLY for logged-in users */}
          <Route
            path="/room/:room"
            element={
              <RequireAuth>
                <App />
              </RequireAuth>
            }
          />

          {/* Dashboard: also only when logged in */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
