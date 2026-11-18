import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkAO1vbjpkkwRYKd9qjQ-Ab2zLcqN_zqg",
  authDomain: "home-service-connect-3b8cc.firebaseapp.com",
  projectId: "home-service-connect-3b8cc",
  storageBucket: "home-service-connect-3b8cc.firebasestorage.app",
  messagingSenderId: "884927174661",
  appId: "1:884927174661:web:acc15a2d24b787ba64246c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();