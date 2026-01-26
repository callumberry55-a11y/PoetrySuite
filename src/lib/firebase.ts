// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzFHZkk45_Vc7k1cqK6GYxX7VL2WWvfXI",
  authDomain: "poetrysuite-40372323-40609.firebaseapp.com",
  projectId: "poetrysuite-40372323-40609",
  storageBucket: "poetrysuite-40372323-40609.firebasestorage.app",
  messagingSenderId: "474607129063",
  appId: "1:474607129063:web:6c5fed2c3fd67be124ed42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
