import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "..";

const COLLECTION_NAME = "users";

export const createUserIfNotExists = async (user: User): Promise<User> => {
    console.log(user, "------------ in users.ts");
    const dbRef = doc(db, "users", user.uid.toString());
    try {
        const docRef = await setDoc(dbRef, user);

        return {
            ...user,
        } as User;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const getUser = async (uid: string): Promise<User> => {
    const dbRef = doc(db, "users", uid);
    try {
        const docRef = await getDoc(dbRef);

        return {
            ...docRef.data(),
        } as User;
    } catch (e) {
        console.log(e);
        throw e;
    }
};
