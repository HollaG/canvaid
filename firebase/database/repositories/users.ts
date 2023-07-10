import { AppUser } from "@/types/user";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "..";

const COLLECTION_NAME = "users";

export const createUserIfNotExists = async (user: User): Promise<AppUser> => {
    console.log(user, "------------ in users.ts");
    const dbRef = doc(db, "users", user.uid.toString());
    const dbUser = await getDoc(dbRef);
    try {
        if (dbUser.exists()) {
            // await updateDoc(dbRef, )

            return {
                ...dbUser.data(),
            } as AppUser;
        } else {
            const docRef = await setDoc(dbRef, user);

            return {
                ...user,
                canvasApiToken: "",
                uploadedIds: [],
            } as AppUser;
        }
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
