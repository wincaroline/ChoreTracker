import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0CnGU0P-VnD3PZO4rPp53D-M5ReqLj7o",
  authDomain: "chorelog-3ad73.firebaseapp.com",
  projectId: "chorelog-3ad73",
  storageBucket: "chorelog-3ad73.firebasestorage.app",
  messagingSenderId: "291820488818",
  appId: "1:291820488818:web:ce02bbfc4b07459c7e5aeb",
  measurementId: "G-NZM6PJE6T3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);