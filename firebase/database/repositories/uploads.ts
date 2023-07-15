import { CanvasQuiz, Quiz, QuizAttempt, annotations } from "@/types/canvas";
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
import { auth } from "../../config";
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

    const existingQuizQuery = query(
        dbRef,
        where("quizName", "==", quizAttempt.quizName),
        where("userUid", "==", quizAttempt.userUid)
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

        // Check if the user has already submitted this attempt.
        const hasSubmitted = fieldDataSubmissions.some(
            (submission) =>
                submission.attempt === quizAttempt.submission.attempt
        );
        if (hasSubmitted) {
            throw new Error("You have already submitted this attempt!");
        }

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
): Promise<Array<Quiz & { id: string }>> => {
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
    return data as Array<Quiz & { id: string }>;
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
export const updateQuizQuestionFlag = async (
    quiz: Quiz & { id: string },
    questionId: number,
    isFlagged: boolean
) => {
    try {
        console.log("flag number" + questionId);
        const existingQuiz = doc(db, COLLECTION_NAME, quiz.id);
        const existingQuizData = (await getDoc(existingQuiz)).data() as Quiz;
        const existingQuestions = existingQuizData.questions;

        // update the flag
        const newQuestions = existingQuestions.map((question) => {
            if (question.id === questionId) {
                question.isFlagged = isFlagged;
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
export const addQuizQuestionAnnotation = async (
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
                const exisingAnnotations: annotations = {
                    annotation: newAnnotation,
                    annotationID: question.annotations.length + 1,
                };
                question.annotations = [
                    ...question.annotations,
                    exisingAnnotations,
                ];
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

export const deleteAttempt = async (
    quizId: string,
    uid: string,
    attemptNumber: number
) => {
    try {
        const quizRef = doc(db, COLLECTION_NAME, quizId);

        const quizDoc = await getDoc(quizRef);
        const quizData = quizDoc.data() as Quiz;

        if (quizData.userUid !== uid) {
            throw new Error("Not authorized");
        }
        // remove the submission and selected options
        const submissionIndex = quizData.submissions.findIndex(
            (submission) => submission.attempt === attemptNumber
        );

        const removedSubmissions = quizData.submissions.splice(
            submissionIndex,
            1
        );
        const removedSelectedOptions = quizData.selectedOptions.splice(
            submissionIndex,
            1
        );

        if (quizData.submissions.length === 0) {
            // no more
            await deleteDoc(quizRef);

            return {
                status: "deleted",
            };
        } else {
            // update
            await updateDoc(quizRef, {
                submissions: quizData.submissions,
                selectedOptions: quizData.selectedOptions,
            });
            return {
                status: "updated",
                data: { ...quizData, id: quizId },
            };
        }
    } catch (e: any) {
        return e.toString();
    }
};

export const deleteQuiz = async (quizId: string, uid: string) => {
    try {
        const quizRef = doc(db, COLLECTION_NAME, quizId);

        const quizDoc = await getDoc(quizRef);
        const quizData = quizDoc.data() as Quiz;

        if (quizData.userUid !== uid) {
            throw new Error("Not authorized");
        }

        await deleteDoc(quizRef);

        return "";
    } catch (e: any) {
        return e.toString();
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
