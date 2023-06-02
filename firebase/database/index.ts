// https://stackoverflow.com/questions/71492939/uncaught-error-cannot-find-module-firebase

// import firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase_app from "../config";

export const db = getFirestore(firebase_app);
