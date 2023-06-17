import { Quiz, QuizAttempt } from "@/types/canvas";
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";
import { db } from "..";

const COLLECTION_NAME = "uploads";

export const create = async (quizAttempt: QuizAttempt): Promise<Quiz> => {
    const dbRef = collection(db, COLLECTION_NAME);
    // delete all null fields
    recursivelyReplaceNullToZero(quizAttempt);
    try {
        const existingQuizQuery = query(
            dbRef,
            where("quizName", "==", quizAttempt.quizName)
        );

        const existingSnapshot = await getDocs(existingQuizQuery);
        console.log("existingSnap :" + existingSnapshot);
        if (existingSnapshot.size === 0) {
            console.log("Creating new!");
            const newQuiz: Quiz = {
                // maybe use inheritance for types instead for mutliple quiz attempt
                submissions: [quizAttempt.submission],
                questions: quizAttempt.questions,
                selectedOptions: [quizAttempt.selectedOptions],
                quizName: quizAttempt.quizName,
                course: quizAttempt.course,
                userUid: quizAttempt.userUid,
            };
            // recursivelyReplaceNullToZero(newQuiz);
            console.log(JSON.stringify(newQuiz, null, 2));
            const docRef = await addDoc(dbRef, newQuiz);

            return {
                id: docRef.id,
                ...newQuiz,
            } as Quiz;
        } else {
            console.log("Updating with new attempt!");
            const latestDoc = existingSnapshot.docs[0];
            const existingData = latestDoc.data() as Quiz;
            console.log("Existing Data:", existingData);
            const fieldDataSubmissions = existingData.submissions;

            const fieldDataSelectedOptions = existingData.selectedOptions || [];

            console.log("New Submission:", quizAttempt);

            fieldDataSubmissions.push(quizAttempt.submission);
            fieldDataSelectedOptions.push(quizAttempt.selectedOptions);

            await updateDoc(latestDoc.ref, {
                submissions: fieldDataSubmissions,
                selectedOptions: fieldDataSelectedOptions,
            });

            return {
                id: latestDoc.id,
                ...existingData,
            } as Quiz;
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};
// const quizId = existingSnapshot.docs[0].id;

// const quizRef = doc(dbRef, quizId);

// console.log("quizRef:", quizRef.path);
// const existingQuizAttempts = (await getDoc(quizRef)).data() as MultipleQuizAttempt;
// console.log("existingQuizDoc:", existingQuizAttempts);
// console.log("existingQuizAttempts.qns: ");
// console.log(JSON.stringify(existingQuizAttempts.submission, null, 2))
// existingQuizAttempts.submission = existingQuizAttempts.submission || [];
// existingQuizAttempts.selectedOptions = existingQuizAttempts.selectedOptions || [];
// console.log("quizAttempt.submission:", quizAttempt.submission);

//console.log("existingQuizAttempts.submission before update: ", existingQuizAttempts.submission);
// console.log("existingQuizAttempts.selectedOptions before update: ", existingQuizAttempts.selectedOptions);

// console.log("existingQuizAttempts.submission after update: ", existingQuizAttempts.submission);
// console.log("existingQuizAttempts.selectedOptions after update: ", existingQuizAttempts.selectedOptions);

// // ...

// console.log("existingQuizAttempts after update: ", existingQuizAttempts);

// retrieve all uploads by the user
export const getAttempts = async (
    uid: string
): Promise<Array<QuizAttempt & { id: string }>> => {
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

    // return and convert back it array
    return data as Array<QuizAttempt & { id: string }>;
};

export const getQuizUpload = async (
    uploadId: string
): Promise<Quiz & { id: string }> => {
    const uploadRef = doc(db, COLLECTION_NAME, uploadId);
    const docSnap = await getDoc(uploadRef);

    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as Quiz & { id: string };
    } else {
        throw new Error("No such document!");
    }
};

function recursivelyReplaceNullToZero(j: any) {
    for (var i in j) {
        if (typeof j[i] === "object") {
            recursivelyReplaceNullToZero(j[i]);
        }
        if (j[i] === null || j[i] === undefined) {
            delete j[i];
        }
    }
}
