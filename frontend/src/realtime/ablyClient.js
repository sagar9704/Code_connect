// src/realtime/ablyClient.js
import * as Ably from "ably";

const apiKey = import.meta.env.VITE_ABLY_API_KEY;

if (!apiKey) {
  console.error(
    "❌ VITE_ABLY_API_KEY is missing. Put it in .env.local as:\nVITE_ABLY_API_KEY=your-ably-key"
  );
}

const ably = new Ably.Realtime({
  key: apiKey,
  clientId: "codeconnect-web",
});

ably.connection.on("connected", () => {
  console.log("✅ Ably connected. Connection id:", ably.connection.id);
});

ably.connection.on("failed", (err) => {
  console.error("❌ Ably connection failed:", err);
});

export default ably;
