import { CanvasQuiz, Quiz, QuizAttempt } from "@/types/canvas";
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    orderBy,
    deleteDoc,
} from "firebase/firestore";
import { db } from "..";
import{auth} from "../../config"
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || "uploads";
const CANVAS_HTTP_OPTIONS = {
    method: "GET",
    headers: new Headers({
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CANVAS_TEST_TOKEN}`,
        Accept: "application/json",
    }),
};

export const create = async (
    quizAttempt: QuizAttempt,
    quizInformation: CanvasQuiz
): Promise<Quiz & { id: string }> => {
    const dbRef = collection(db, COLLECTION_NAME);
    // delete all null fields
    recursivelyReplaceNullToZero(quizAttempt);
    try {
        
        const existingQuizQuery = query(
            dbRef,
            where("quizName", "==", quizAttempt.quizName),where("userUid", "==", auth.currentUser?.uid)
        );

        const existingSnapshot = await getDocs(existingQuizQuery);
        //console.log("existingSnap :" + existingSnapshot);
        if (existingSnapshot.size === 0) {
            console.log("Creating new!");
            console.log(quizAttempt.questions);

            // first, get the quiz data from canvas
            // const res = await fetch(`${CANVAS_URL}courses/${}`)

            const newQuiz: Quiz = {
                // maybe use inheritance for types instead for mutliple quiz attempt
                submissions: [quizAttempt.submission],
                questions: quizAttempt.questions,
                selectedOptions: [quizAttempt.selectedOptions],
                quizName: quizAttempt.quizName,
                course: quizAttempt.course,
                userUid: quizAttempt.userUid,
                lastUpdated: new Date(),
                quizInfo: quizInformation,
            };
            // recursivelyReplaceNullToZero(newQuiz);
            console.log(JSON.stringify(newQuiz, null, 2));
            const docRef = await addDoc(dbRef, newQuiz);

            return {
                id: docRef.id,
                ...newQuiz,
            } as Quiz & { id: string };
        } else {
            console.log("Updating with new attempt!");
            const latestDoc = existingSnapshot.docs[0];
            const existingData = latestDoc.data() as Quiz;
            console.log("Existing Data:", existingData);
            const fieldDataSubmissions = existingData.submissions;

            const fieldDataSelectedOptions = existingData.selectedOptions || [];

            const existingQuestions = existingData.questions;

            // merge the existing questions with the new ones. two questions are the same if they have the same ID
            const newAttemptQuestions = quizAttempt.questions;
            const mergedQuestions = [
                ...existingQuestions,
                ...newAttemptQuestions.filter(
                    (newQuestion) =>
                        !existingQuestions.some(
                            (existingQuestion) =>
                                existingQuestion.id === newQuestion.id
                        )
                ),
            ];

            console.log("New Submission:", quizAttempt);

            fieldDataSubmissions.push(quizAttempt.submission);
            fieldDataSelectedOptions.push(quizAttempt.selectedOptions);

            await updateDoc(latestDoc.ref, {
                submissions: fieldDataSubmissions,
                selectedOptions: fieldDataSelectedOptions,
                questions: mergedQuestions,
                lastUpdated: new Date(),
            });

            return {
                id: latestDoc.id,
                ...existingData,
            } as Quiz & { id: string };
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
    const q = query(
        attemptsRef,
        where("userUid", "==", uid),
        orderBy("lastUpdated", "desc")
    );
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

export const updateQuizQuestionAnnotation = async (
    quiz: Quiz & { id: string },
    questionId: number,
    newAnnotation: string
) => {
    try {
        console.log("annotation number" + questionId);
        const existingQuiz = doc(db, COLLECTION_NAME, quiz.id);
        const existingQuizData = (await getDoc(existingQuiz)).data() as Quiz;
        const existingQuestions = existingQuizData.questions;

        // update the annotations
        const newQuestions = existingQuestions.map((question) => {
            if (question.id === questionId) {
                question.annotations = [...question.annotations, newAnnotation];
            }
            return question;
        });

        // update the quiz
        existingQuizData.questions = newQuestions;
        await updateDoc(existingQuiz, existingQuizData);

        return {
            ...existingQuizData,
            id: quiz.id,
        };
    } catch (e) {
        console.log("ERROR:", e);
        throw e;
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
