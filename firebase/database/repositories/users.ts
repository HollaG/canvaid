import { AppUser } from "@/types/user";
import { User } from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "..";

const COLLECTION_NAME = "users";

export const createUserIfNotExists = async (user: User): Promise<AppUser> => {
    const dbRef = doc(db, "users", user.uid.toString());
    const dbUser = await getDoc(dbRef);
    try {
        if (dbUser.exists()) {
            // await updateDoc(dbRef, )

            return {
                ...dbUser.data(),
                // add the animation
                accessibility:
                    dbUser.data()?.accessibility === undefined
                        ? false
                        : dbUser.data()?.accessibility,
            } as AppUser;
        } else {
            const docRef = await setDoc(dbRef, user);

            return {
                ...user,
                canvasApiToken: "",
                uploadedIds: [],
                courseColors: {},
                accessibility: true,
            } as AppUser;
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const getUser = async (uid: string): Promise<AppUser> => {
    const dbRef = doc(db, "users", uid);
    try {
        const docRef = await getDoc(dbRef);

        return {
            ...docRef.data(),
        } as AppUser;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const updateUserColorChoice = async (
    uid: string,
    courseCode: string,
    color: string
) => {
    const dbRef = doc(db, "users", uid);
    try {
        await updateDoc(dbRef, {
            [`courseColors.${courseCode}`]: color,
        });

        return true;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const updateUserAccessibility = async (
    uid: string,
    accessibility: boolean
) => {
    const dbRef = doc(db, "users", uid);
    try {
        await updateDoc(dbRef, {
            accessibility,
        });

        return true;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const updateUserExtensionToken = async (
    uid: string,
    extensionToken: string
) => {
    const dbRef = doc(db, "users", uid);
    try {
        await updateDoc(dbRef, {
            extensionToken,
        });

        return true;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const findByExtensionToken = async (
    extensionToken: string
): Promise<AppUser | null> => {
    const dbRef = collection(db, "users");
    try {
        const querySnapshot = query(
            dbRef,
            where("extensionToken", "==", extensionToken)
        );
        const existingSnapshot = await getDocs(querySnapshot);
        const latestDoc = existingSnapshot.docs[0];
        const existingData = latestDoc.data() as AppUser;
        return existingData;
    } catch (e) {
        console.log(e);
        throw e;
    }
};
