// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBIm1Sc2IhaxDsF-3wgvDKjklCWiCt5Kxk",
    authDomain: "kindbyte-543fc.firebaseapp.com",
    projectId: "kindbyte-543fc",
    storageBucket: "kindbyte-543fc.firebasestorage.app",
    messagingSenderId: "521834167856",
    appId: "1:521834167856:web:18795aa4dbb2175ab0f7f5",
    measurementId: "G-M46CBV91NZ"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);