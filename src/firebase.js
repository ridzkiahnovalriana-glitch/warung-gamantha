// src/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 1. Tambahkan import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHM3uT22nYvoZKY-Gq8ur8pFBqz1ih7XI",
  authDomain: "warung-sembako-gamantha.firebaseapp.com",
  projectId: "warung-sembako-gamantha",
  storageBucket: "warung-sembako-gamantha.firebasestorage.app",
  messagingSenderId: "873934865527",
  appId: "1:873934865527:web:acf9260dfac0356ba6b272",
  measurementId: "G-BGFT2TH6C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. Inisialisasi dan export Firestore database agar bisa dipanggil komponen lain
export const db = getFirestore(app);