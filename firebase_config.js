// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYs994zhP4GUh5FYS_ciZR4I_PjjnFciI",
  authDomain: "bmg2025.firebaseapp.com",
  projectId: "bmg2025",
  storageBucket: "bmg2025.firebasestorage.app",
  messagingSenderId: "544200483064",
  appId: "1:544200483064:web:d2f8eea3011034e52f5b0d",
  measurementId: "G-PG43RR0P7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
