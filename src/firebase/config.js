import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";


const firebaseConfig = {
  apiKey: "AIzaSyBeIOvoNggCPbGfiacRHQJkvXd7JgszQQU",
  authDomain: "noizzy-8b1ea.firebaseapp.com",
  projectId: "noizzy-8b1ea",
  storageBucket: "noizzy-8b1ea.firebasestorage.app",
  messagingSenderId: "658452791165",
  appId: "1:658452791165:web:cbbde6d7c34146b8489614"
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const FirebaseAuth = getAuth( FirebaseApp );
export const FirebaseDB = getFirestore( FirebaseApp );
export const GoogleProvider = new GoogleAuthProvider();