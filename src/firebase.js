// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyBW89rYoVJHabQTB_y02FTVmPX17h585e8",
  authDomain: "san-mateo-eats.firebaseapp.com",
  projectId: "san-mateo-eats",
  storageBucket: "san-mateo-eats.firebasestorage.app",
  messagingSenderId: "88838680551",
  appId: "1:88838680551:web:82e8883facacacebbf9742",
  measurementId: "G-VFPGJFEHMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };