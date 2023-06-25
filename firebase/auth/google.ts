import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebase_app, { auth } from "../config";

import "firebase/compat/auth";

const googleAuthProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleAuthProvider);
export const signOutWithGoogle = () => auth.signOut();
