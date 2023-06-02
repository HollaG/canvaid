import { QuizAttempt } from "@/types/canvas";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "..";

const COLLECTION_NAME = "uploads";

export const create = async (
    quizAttempt: QuizAttempt
): Promise<QuizAttempt> => {
    console.log("Creating!");
    const dbRef = collection(db, COLLECTION_NAME);
    try {
        const docRef = await addDoc(dbRef, quizAttempt);
        return {
            id: docRef.id,
            ...quizAttempt,
        } as QuizAttempt;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

// retrieve all uploads by the user
export const getAttempts = async (uid: string): Promise<Array<QuizAttempt>> => {
    const attemptsRef = collection(db, COLLECTION_NAME);
    const q = query(attemptsRef, where("userUid", "==", uid));
    const data: Array<any> = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());

        data.push({
            id: doc.id,
            ...doc.data(),
        });
    });

    // return and convert back it array of todo
    return data as Array<QuizAttempt>;
};
