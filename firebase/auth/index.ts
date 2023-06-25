import { signOut } from "firebase/auth";
import { auth } from "../config";

export const signOutAll = () => {
    console.log("Signing out...");

    signOut(auth).catch(console.error);
};
