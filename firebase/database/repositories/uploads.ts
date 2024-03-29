import { ACADEMIC_SEMESTER, ACADEMIC_YEAR } from "@/lib/constants";
import { getRandomColor } from "@/lib/functions";

import {
    CanvasQuiz,
    Quiz,
    QuizAttempt,
    QuizResponse,
    annotations,
    QuizAnswers,
    QuizSubmissionQuestion,
} from "@/types/canvas";
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
    setDoc,
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
export const individualExamUpdate = async (
    index: number,
    examAnswers: QuizResponse,
    quizName: string,
    userUid: string
) => {
    const dbRef = collection(db, COLLECTION_NAME);
    const existingQuizQuery = query(
        dbRef,
        where("quizName", "==", quizName),
        where("userUid", "==", userUid)
    );

    const existingSnapshot = await getDocs(existingQuizQuery);
    const latestDoc = existingSnapshot.docs[0];
    const existingData = latestDoc.data() as Quiz;

    existingData.selectedOptions[index] = examAnswers;
    await updateDoc(latestDoc.ref, existingData);
};

export const create = async (
    quizAttempt: QuizAttempt,
    quizInformation: CanvasQuiz
): Promise<Quiz & { id: string }> => {
    // assign a random color if it doesn't exist

    const userRef = doc(db, "users", quizAttempt.userUid.toString());
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) throw new Error("No user data found!");
    const userCourseColors = userData.courseColors;
    const courseCode = quizAttempt.course.split(" ")[0];
    if (!userCourseColors || !userCourseColors[courseCode]) {
        await updateDoc(userRef, {
            courseColors: {
                ...userCourseColors,
                [courseCode]: getRandomColor(),
            },
        });
    } else {
        // don't do anything, already has a color.
    }

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
        // first, get the quiz data from canvas
        // const res = await fetch(`${CANVAS_URL}courses/${}`)

        const quizAnswers: QuizAnswers = {};
        for (const assessment_question_id in quizAttempt.selectedOptions) {
            const response =
                quizAttempt.selectedOptions[assessment_question_id];

            if (
                response.your_score === response.total_score ||
                response.correct_answer_ids ||
                response.correct_answer_text
            ) {
                // we know the correct answers
                quizAnswers[assessment_question_id] = {};
                if (response.correct_answer_ids) {
                    quizAnswers[assessment_question_id].correct_answer_ids =
                        response.correct_answer_ids;
                }
                if (response.correct_answer_text) {
                    quizAnswers[assessment_question_id].correct_answer_text =
                        response.correct_answer_text;
                }
                if (response.total_score) {
                    quizAnswers[assessment_question_id].total_score =
                        response.total_score;
                }
            }
        }

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

            quizAnswers,

            quizSettings: {
                academicYear: ACADEMIC_YEAR,
                semester: ACADEMIC_SEMESTER,
                isPinned: false,
            },
        };

        const docRef = await addDoc(dbRef, newQuiz);

        return {
            id: docRef.id,
            ...newQuiz,
        } as Quiz & { id: string };
    } else {
        const latestDoc = existingSnapshot.docs[0];
        const existingData = latestDoc.data() as Quiz;

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

        fieldDataSubmissions.push(quizAttempt.submission);
        fieldDataSelectedOptions.push(quizAttempt.selectedOptions);

        // for all of the selected options, generate the new quiz answers
        const existingQuizAnswers = existingData.quizAnswers || {};
        for (const assessment_question_id in quizAttempt.selectedOptions) {
            const response =
                quizAttempt.selectedOptions[assessment_question_id];

            if (
                response.your_score === response.total_score ||
                response.correct_answer_ids ||
                response.correct_answer_text
            ) {
                // we know the correct answers
                // add only if undefined

                existingQuizAnswers[assessment_question_id] = {};
                if (response.correct_answer_ids) {
                    existingQuizAnswers[
                        assessment_question_id
                    ].correct_answer_ids = response.correct_answer_ids;
                }
                if (response.correct_answer_text) {
                    existingQuizAnswers[
                        assessment_question_id
                    ].correct_answer_text = response.correct_answer_text;
                }
                if (response.total_score) {
                    existingQuizAnswers[assessment_question_id].total_score =
                        response.total_score;
                }
            }
        }

        await updateDoc(latestDoc.ref, {
            submissions: fieldDataSubmissions,
            selectedOptions: fieldDataSelectedOptions,
            questions: mergedQuestions,
            lastUpdated: new Date(),
            quizAnswers: existingQuizAnswers,
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

export const deleteQuizQuestionAnnotation = async (
    ID: string,
    annotationID: number,
    question: QuizSubmissionQuestion
) => {
    try {
        const existingQuiz = doc(db, COLLECTION_NAME, ID);
        const existingQuizData = (await getDoc(existingQuiz)).data() as Quiz;
        const existingQuestions = existingQuizData.questions;
        const newQuestions = existingQuestions.map((qn) => {
            if (qn.id === question.id) {
                qn.annotations = qn.annotations.filter(
                    (ann) => ann.annotationID !== annotationID
                );
            }
            return qn;
        });
        existingQuizData.questions = newQuestions;
        await updateDoc(existingQuiz, existingQuizData);
        const updatedQuiz = {
            ...existingQuizData,
            id: ID,
        };

        return updatedQuiz;
    } catch (e) {
        console.log(e);
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

/**
 * Toggles the pin state of the quiz.
 * Relies on `onSnapshot` to update the UI.
 *
 * @param quizId The quiz ID to pin / unpin
 * @returns
 */
export const togglePinQuiz = async (quizId: string) => {
    try {
        const quizRef = doc(db, COLLECTION_NAME, quizId);

        const quizDoc = await getDoc(quizRef);
        const quizData = quizDoc.data() as Quiz;

        await updateDoc(quizRef, {
            "quizSettings.isPinned": !quizData.quizSettings.isPinned,
        });

        return {
            isPinned: !quizData.quizSettings.isPinned,
        };
    } catch (e: any) {
        return e.toString();
    }
};

/**
 * Uploads the exam template to the database for Exam Mode.
 *
 * @param quiz The quiz that an exam will be done
 * @returns
 */
export const uploadExamTemplate = async (quiz: Quiz) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), quiz);

        return {
            ...quiz,
            id: docRef.id,
        } as Quiz & { id: string };
    } catch (e) {
        console.log("ERROR:", e);
        throw e;
    }
};

/**
 * Imports an external quiz (someone elses') to the user's account.
 *
 * @param quiz The quiz to import
 * @param uid The user uid who is importing
 */
export const importToSelf = async (
    quiz: Quiz & { id?: string },
    uid: string
) => {
    try {
        // the old quiz id needs to be deleted
        const copiedQuiz = { ...quiz };
        delete copiedQuiz.id;
        const docRef = await addDoc(
            collection(db, COLLECTION_NAME),
            copiedQuiz as Quiz
        );

        return {
            ...quiz,
            id: docRef.id,
        } as Quiz & { id: string };
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
