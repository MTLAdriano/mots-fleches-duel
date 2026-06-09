import { db, rtdb } from "./firebase.js";
import {
  doc, setDoc, getDoc, updateDoc, onSnapshot,
  collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, set, update, onValue, onDisconnect, serverTimestamp as rtServerTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Generate a short readable room ID
function genRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── CREATE ────────────────────────────────────────────────────────────────

export async function createRoom({ uid, pseudo, gridData, mode = "classic" }) {
  const roomId = genRoomId();

  // Firestore: room metadata
  await setDoc(doc(db, "rooms", roomId), {
    roomId,
    gameDate: gridData.date,
    gridId: gridData.id,
    totalWords: gridData.totalWords,
    status: "waiting",
    mode,
    blitzDuration: mode === "blitz" ? 300 : null,
    createdAt: serverTimestamp(),
    startedAt: null,
    finishedAt: null,
    player1: uid,
    player2: null,
    winner: null
  });

  // Firestore: player1 sub-doc
  await setDoc(doc(db, "rooms", roomId, "players", uid), {
    uid,
    pseudo,
    score: 0,
    elo: 1000,
    completedAt: null,
    joinedAt: serverTimestamp()
  });

  // Realtime DB: live state
  await set(ref(rtdb, `rooms/${roomId}/players/${uid}`), {
    foundWords: [],
    lastFoundAt: null,
    ready: true
  });

  // Presence: clean up on disconnect
  onDisconnect(ref(rtdb, `rooms/${roomId}/players/${uid}/online`)).set(false);
  await set(ref(rtdb, `rooms/${roomId}/players/${uid}/online`), true);

  return roomId;
}

// ─── JOIN ──────────────────────────────────────────────────────────────────

export async function joinRoom({ roomId, uid, pseudo }) {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) throw new Error("Room introuvable");
  const room = roomSnap.data();
  if (room.status === "finished") throw new Error("Cette partie est terminée");
  if (room.player2 && room.player2 !== uid) throw new Error("Room déjà complète");

  // Already player1? Just reconnect
  if (room.player1 === uid) return room;

  // Join as player2 - status reste "waiting", le host lance manuellement
  await updateDoc(roomRef, { player2: uid });

  await setDoc(doc(db, "rooms", roomId, "players", uid), {
    uid, pseudo, score: 0, elo: 1000, completedAt: null, joinedAt: serverTimestamp()
  });

  await set(ref(rtdb, `rooms/${roomId}/players/${uid}`), {
    foundWords: [], lastFoundAt: null, ready: true
  });

  onDisconnect(ref(rtdb, `rooms/${roomId}/players/${uid}/online`)).set(false);
  await set(ref(rtdb, `rooms/${roomId}/players/${uid}/online`), true);

  return roomSnap.data();
}

// ─── WORD FOUND ────────────────────────────────────────────────────────────

export async function submitWord({ roomId, uid, wordId, totalFound, totalWords }) {
  // Update realtime DB (live opponent view)
  const playerRef = ref(rtdb, `rooms/${roomId}/players/${uid}`);
  const snap = await new Promise(resolve => onValue(playerRef, resolve, { onlyOnce: true }));
  const current = snap.val() || {};
  const foundWords = [...(current.foundWords || []), wordId];

  await update(playerRef, {
    foundWords,
    lastFoundAt: rtServerTimestamp()
  });

  // Update Firestore score
  await updateDoc(doc(db, "rooms", roomId, "players", uid), {
    score: totalFound
  });

  // Check if game complete
  if (totalFound >= totalWords) {
    await finishGame({ roomId, uid });
  }
}

// ─── FINISH ────────────────────────────────────────────────────────────────

export async function finishGame({ roomId, uid }) {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const room = roomSnap.data();
  if (room.status === "finished") return; // Already done

  await updateDoc(roomRef, {
    status: "finished",
    winner: uid,
    finishedAt: serverTimestamp()
  });

  await updateDoc(doc(db, "rooms", roomId, "players", uid), {
    completedAt: serverTimestamp()
  });

  // Update Elo
  await updateElo(roomId, room, uid);
}

// ─── ELO ───────────────────────────────────────────────────────────────────

async function updateElo(roomId, room, winnerId) {
  const loserId = room.player1 === winnerId ? room.player2 : room.player1;
  if (!loserId) return; // Solo game

  const [p1Snap, p2Snap] = await Promise.all([
    getDoc(doc(db, "rooms", roomId, "players", winnerId)),
    getDoc(doc(db, "rooms", roomId, "players", loserId))
  ]);

  const eloW = p1Snap.data()?.elo || 1000;
  const eloL = p2Snap.data()?.elo || 1000;
  const K = 32;
  const expectedW = 1 / (1 + Math.pow(10, (eloL - eloW) / 400));
  const delta = Math.round(K * (1 - expectedW));

  await Promise.all([
    updateDoc(doc(db, "rooms", roomId, "players", winnerId), { elo: eloW + delta }),
    updateDoc(doc(db, "rooms", roomId, "players", loserId), { elo: eloL - delta })
  ]);
}

// ─── LISTENERS ─────────────────────────────────────────────────────────────

export function listenRoom(roomId, callback) {
  return onSnapshot(doc(db, "rooms", roomId), snap => {
    if (snap.exists()) callback(snap.data());
  });
}

export function listenOpponentLive(roomId, opponentUid, callback) {
  const playerRef = ref(rtdb, `rooms/${roomId}/players/${opponentUid}`);
  return onValue(playerRef, snap => {
    callback(snap.val() || {});
  });
}

export function listenMyLive(roomId, uid, callback) {
  const playerRef = ref(rtdb, `rooms/${roomId}/players/${uid}`);
  return onValue(playerRef, snap => {
    callback(snap.val() || {});
  });
}

// ─── REMATCH ───────────────────────────────────────────────────────────────

export async function requestRematch({ roomId, uid, pseudo, gridData, mode }) {
  const roomSnap = await getDoc(doc(db, "rooms", roomId));
  const room = roomSnap.data();
  const opponentUid = room.player1 === uid ? room.player2 : room.player1;

  // Create new room, preserve opponent info via rematchFrom
  const newRoomId = await createRoom({ uid, pseudo, gridData, mode });
  await updateDoc(doc(db, "rooms", newRoomId), {
    rematchFrom: roomId,
    invitedPlayer: opponentUid
  });

  return newRoomId;
}
