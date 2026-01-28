// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJqwQ4IyDLoN4zm5X8YNpweoyp1g6gSUU",
  authDomain: "poetrysuite-76507980-fe0db.firebaseapp.com",
  projectId: "poetrysuite-76507980-fe0db",
  storageBucket: "poetrysuite-76507980-fe0db.firebasestorage.app",
  messagingSenderId: "931649099035",
  appId: "1:931649099035:web:d6e7d393ffb3bb1a2d2fbe"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);