// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // <--- TAMBAHKAN IMPORT INI

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKerVVynvh2puu7Cqe0wZQ5HNChogCH6c", // HATI-HATI: Sebaiknya gunakan environment variables untuk API Key
  authDomain: "tubes-e7c2f.firebaseapp.com",
  databaseURL: "https://tubes-e7c2f-default-rtdb.firebaseio.com",
  projectId: "tubes-e7c2f",
  storageBucket: "tubes-e7c2f.firebasestorage.app",
  messagingSenderId: "696576915587",
  appId: "1:696576915587:web:d7d02c2d5020821682c3b6",
  measurementId: "G-ZK9PQFDJK7"
};

// Initialize Firebase (CUKUP SEKALI)
const app = initializeApp(firebaseConfig);

// Initialize Analytics (opsional, jika kamu menggunakannya)
const analytics = getAnalytics(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app); // <-- `database` dideklarasikan di sini

// Export instances yang dibutuhkan agar bisa digunakan di file lain
// Gabungkan semua export dalam satu pernyataan jika memungkinkan
export { app, analytics, database }; // <-- 'database' sekarang diekspor dengan benar