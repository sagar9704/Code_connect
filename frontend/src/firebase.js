// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
// 🔹 analytics is optional; we’ll skip it to keep things simple
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  // ⚠️ Paste the REAL config from Firebase console here
  apiKey: "AIzaSyBw7TwOgi5NHuw68GKEEDG1mw6PohT9mXk", // starts with "AIza..."
  authDomain: "codeconnect-3fd82.firebaseapp.com",
  projectId: "codeconnect-3fd82",
  storageBucket: "codeconnect-3fd82.appspot.com",
  messagingSenderId: "143939187612",
  appId: "1:143939187612:web:1ef9619caa39d5f4dc0e59",
  measurementId: "G-EDTYK95KBC",
};

const app = initializeApp(firebaseConfig);
console.log("🔥 Using Firebase project:", app.options.projectId);

// Optional: only if you really want analytics later
// const analytics = getAnalytics(app);

// services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// ---------- helper functions for snippets ----------
const SNIPPETS_COLLECTION = "snippets";

export async function saveSnippetToCloud({ name, language, code, roomId }) {
  const user = auth.currentUser || null;
  const createdAt = new Date().toISOString();

  const payload = {
    name,
    language,
    code,
    roomId: roomId || null,
    createdAt,
    ownerId: user ? user.uid : null, // logged-in user, or null (old behavior)
  };

  const ref = await addDoc(collection(db, SNIPPETS_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function getRecentSnippets(ownerId = null) {
  const baseRef = collection(db, SNIPPETS_COLLECTION);

  const qRef = ownerId
    ? query(
        baseRef,
        where("ownerId", "==", ownerId),
        orderBy("createdAt", "desc"),
        limit(50)
      )
    : query(baseRef, orderBy("createdAt", "desc"), limit(50));

  const snap = await getDocs(qRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSnippetById(id) {
  const ref = doc(db, SNIPPETS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
