import firebase_app from "../config";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

const auth = getAuth(firebase_app);

export default async function signUp() {
    // let result = null,
    //     error = null;
    // try {
    //     result = await createUserWithEmailAndPassword(auth, email, password);
    // } catch (e) {
    //     error = e;
    // }
    // return { result, error };
}

export async function createAccountEmail(
    email: string,
    password: string,
    displayName: string
) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCreds) => {
            return updateProfile(userCreds.user, {
                displayName: `${displayName}`.trim(),
            }).then(() => userCreds);
        })
        .then((userCreds) => {
            if (auth.currentUser) {
                auth.currentUser.reload().then(() => userCreds);
            }
            return userCreds;
        });
}

export async function signInEmail(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}
