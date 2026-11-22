import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmt6H3xYAscQFgSgoUvpSVN0b7AfjfezU",
  authDomain: "cypherbird-e57bb.firebaseapp.com",
  projectId: "cypherbird-e57bb",
  storageBucket: "cypherbird-e576b.firebasestorage.app",
  messagingSenderId: "976037053956",
  appId: "1:976037053956:web:b766f6c21b1c37c8bb1751",
  measurementId: "G-5ZQPLEL2ZC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
