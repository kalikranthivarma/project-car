// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwFoWTgT-paokxHTpqHzX-_f2yXLTuJlw",
  authDomain: "cars-3ade9.firebaseapp.com",
  projectId: "cars-3ade9",
  storageBucket: "cars-3ade9.firebasestorage.app",
  messagingSenderId: "440021218342",
  appId: "1:440021218342:web:397da296bc05a227e3e2e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);