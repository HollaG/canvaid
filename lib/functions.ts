// Function to format the time elapsed since and return in a human readable format
// Input: Date string (to be converted using new Date())
// Output:
// < 1 day: "x hours ago"
// < 1 week: "x days ago"
// < 1 month: "x weeks ago"

import { getAttempts } from "@/firebase/database/repositories/uploads";
import { Quiz, QuizAnswers, QuizResponse } from "@/types/canvas";

export const formatTimeElapsed = (date: Date) => {
    const timeElapsed = Math.abs(
        new Date().getTime() - new Date(date).getTime()
    );
    const minutes = Math.floor(timeElapsed / (1000 * 60));
    const days = Math.floor(timeElapsed / (1000 * 3600 * 24));
    const hours = Math.floor(timeElapsed / (1000 * 3600));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);

    if (months > 0) return `${months} month${months === 1 ? "" : "s"} ago`;
    else if (weeks > 0) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    else if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    else if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    else if (minutes > 2)
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    else return "just now";
};

export const getUploads = async (uid: string) => {
    // const res = await fetch(`/api/?uid=${uid}`);

    // return res.json();

    const quizzes = await getAttempts(uid);
    return { data: quizzes };
};

/**
<<<<<<< HEAD
 * Generate the final score for an exam.
 *
 * @param selectedOptions
 * @param quizAnswers
 * @returns
 */
export const hydrateSelectedOptions = (
    selectedOptions: QuizResponse,
    quizAnswers: QuizAnswers
) => {
    // copy the selectedOptions
    const calculated = structuredClone(selectedOptions);

    console.log({ calculated, quizAnswers });

    for (const qnId in calculated) {
        const questionResponse = calculated[qnId];

        // try to find the answer
        const answer = quizAnswers[qnId];
        if (!answer) continue;

        questionResponse.correct_answer_ids = answer.correct_answer_ids;
        questionResponse.correct_answer_text = answer.correct_answer_text;
        questionResponse.total_score = answer.total_score;

        // text input
        // TODO: support for more than 1
        if (
            questionResponse.answer_text &&
            questionResponse.answer_text[0] &&
            questionResponse.correct_answer_text?.[0] ===
                questionResponse.answer_text?.[0]
        ) {
            questionResponse.your_score = answer.total_score;
        }

        // selection input

        questionResponse.your_score = calculateScore(
            questionResponse.selected_answer_ids,
            questionResponse.correct_answer_ids,
            questionResponse.total_score
        );
    }

    return calculated;
};

/**
 * Given the correct answers and the selected answers, calculate the score.
 *
 * Each correct answer is given a score of 1/total_correct_answers.
 * Selecting an answer that is not in the correct answers will deduct the marks by 1/total_correct_answers.
 * Not selecting an answer that is in the correct answers will deduct the marks by 1/total_correct_answers.
 *
 * @param selectedAnswerIds
 * @param correctAnswerIds
 * @param totalScore
 */
export const calculateScore = (
    selectedAnswerIds: number[] | undefined,
    correctAnswerIds: number[] | undefined,
    totalScore: number | undefined
) => {
    let score = 0;

    if (!selectedAnswerIds || !correctAnswerIds || !totalScore) return score;
    if (correctAnswerIds.length === 0 && selectedAnswerIds.length === 0)
        return totalScore;

    // no correct answers
    if (correctAnswerIds.length === 0) return score;

    // no selected answers
    if (selectedAnswerIds.length === 0) return score;

    // correct answer
    if (arraysEqual(selectedAnswerIds, correctAnswerIds)) {
        return totalScore;
    }

    // for every correct answer in selectedAnswers, add 1/totalScore
    const scorePerCorrectAnswer = 1 / correctAnswerIds.length;
    for (const selectedAnswerId of selectedAnswerIds) {
        if (correctAnswerIds.includes(selectedAnswerId)) {
            score += scorePerCorrectAnswer;
        } else {
            score -= scorePerCorrectAnswer;
        }
    }

    return Math.max(0, score);
};

/**
 * Function to check if two arrays contain the same values.
 * Not necessarily in order.
 *
 * @param arr1
 * @param arr2
 *
 * @returns boolean
 */
export const arraysEqual = (arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) return false;

    for (const item of arr1) {
        if (!arr2.includes(item)) return false;
    }

    return true;
};

/**
 * Calculates the total score of a custom quiz.
 *
 * @param selectedOptions
 * @returns
 */
export const calculateTotalScore = (selectedOptions: QuizResponse) => {
    let totalScore = 0;

    for (const qnId in selectedOptions) {
        const questionResponse = selectedOptions[qnId];

        totalScore += questionResponse.your_score || 0;
    }

    return Math.round(totalScore * 100) / 100;
};

/**
 * Convert a custom attempt number to a string.
 * A custom attempt number is negative and starts from -10, going down.
 *
 * Does nothing if the attempt number if positive (not custom)
 *
 * @param attempt
 * @returns formatted string
 */
export const convertCustomAttemptNumber = (attempt: number) => {
    if (attempt > 0) return attempt.toString();
    let a = -1 * attempt;
    a = a - 9;

    return `C${a}`;
};
const availableQuestionTypes = [
    "essay_question",
    "short_answer_question",
    "numerical_question",
    "multiple_choice_question",
    "true_false_question",
    "multiple_answers_question",
];

export const getExaminableQuestions = (quiz?: Quiz & { id: string }) => {
    if (!quiz) return [];
    const answers = quiz.quizAnswers;
    const questions = quiz.questions;

    const examinableQuestions = questions.filter((qn) => {
        // this qn id must be present in answers
        if (availableQuestionTypes.includes(qn.question_type)) {
            return answers[qn.id];
        }
    });

    return examinableQuestions;
};
/**
 * Generate the academic year and semester display.
 *
 * e.g. 23/24 S1
 * e.g. 24/25 ST1
 */
export const getAcademicYearAndSemester = (
    academicYear: number,
    semester: number
) => {
    if (semester === 3 || semester === 4) {
        return `${academicYear - 2000}/${academicYear - 1999} ST${
            semester - 2
        }`;
    } else {
        return `${academicYear - 2000}/${academicYear - 1999} S${semester}`;
    }
};

const CHAKRA_COLORS = [
    "red.700",
    "teal.300",
    "cyan.700",
    "orange.300",
    "yellow.700",
    "blue.300",
    "purple.700",
    "pink.300",
    "green.700",
    "red.300",
    "teal.700",
    "cyan.300",
    "orange.700",
    "yellow.300",
    "blue.700",
    "purple.300",
    "pink.700",
    "green.300",
];

const COLORS = [
    "#9B2C2C",
    "#4FD1C5",
    "#0987A0",
    "#F6AD55",
    "#975A16",
    "#63B3ED",
    "#553C9A",
    "#F687B3",
    "#276749",
    "#FC8181",
    "#285E61",
    "#76E4F7",
    "#9C4221",
    "#F6E05E",
    "#2C5282",
    "#B794F4",
    "#97266D",
    "#68D391",
];

/**
 * Get a random color.
 */
export const getRandomColor = () => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
};

/**
 * Remove all letters from a string.
 */
export const removeLetters = (str: string) => {
    return str.replace(/[a-zA-Z]/g, "");
};
