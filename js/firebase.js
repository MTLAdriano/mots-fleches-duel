import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD5Ts0ricbdGDScoqiTtaVHHKLVep2RCQo",
  authDomain: "mots-fleches-duel.firebaseapp.com",
  projectId: "mots-fleches-duel",
  storageBucket: "mots-fleches-duel.firebasestorage.app",
  messagingSenderId: "277993090744",
  appId: "1:277993090744:web:aaea2c335e74ba35558e4d",
  databaseURL: "https://mots-fleches-duel-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export async function initAuth() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) { resolve(user); return; }
      const cred = await signInAnonymously(auth);
      resolve(cred.user);
    });
  });
}
