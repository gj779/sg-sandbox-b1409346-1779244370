// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLnnqp4qOorUiNOHVXanQu0U9t-iygNb0",
  authDomain: "react-native-staffspace.firebaseapp.com",
  projectId: "react-native-staffspace",
  storageBucket: "react-native-staffspace.appspot.com",
  messagingSenderId: "424087461272",
  appId: "1:424087461272:web:3788dea11e702d82cb9fed",
  measurementId: "G-058VLG6SWH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// get firestore cloud database
export const firestore = getFirestore(app);

// get user authentication
export const auth = getAuth(app);

export const storage = getStorage(app);