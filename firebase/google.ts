import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebase_app from "./config";

import "firebase/compat/auth";

const googleAuthProvider = new GoogleAuthProvider();

const googleAuth = getAuth(firebase_app);

export default googleAuth;

export const signInWithGoogle = () =>
    signInWithPopup(googleAuth, googleAuthProvider);
export const signOutWithGoogle = () => googleAuth.signOut();
