import { create } from "@/firebase/database/repositories/uploads";
import { getUser } from "@/firebase/database/repositories/users";
import {
    CanvasQuiz,
    Course,
    QuestionResponse,
    QuizAttempt,
    QuizResponse,
    CanvasQuizSubmission,
    CanvasQuizSubmissionQuestion,
    QuizSubmissionQuestion,
} from "@/types/canvas";
import { readFile } from "fs";
import { NextResponse } from "next/server";
import parse from "node-html-parser";

export async function GET() {
    //   const res = await fetch('https://data.mongodb-api.com/...', {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'API-Key': process.env.DATA_API_KEY,
    //     },
    //   });
    //   const data = await res.json();
    //   return NextResponse.json({ data });
}

export interface IAddBody {
    html: string;
    quizName: string;
    course: string;
    uid: string;
    canvasApiToken: string;
}

const CANVAS_URL = process.env.NEXT_PUBLIC_CANVAS_URL;

const PARSE_ERROR_MESSAGE = "Error parsing HTML!";
const API_ERROR_MESSAGE =
    "Error accessing the Canvas API! Check if your Canvas token is valid.";
//`https://canvas.instructure.com/api/v1/`;

// https://github.com/vercel/next.js/discussions/39957
export async function POST(request: Request) {
    // todo: error handling
    try {
        const {
            html,
            quizName: _quizName,
            course: _courseName,
            uid,
            canvasApiToken,
        }: IAddBody = await request.json();
        // console.log({ data });

        if (!html) {
            throw new Error(PARSE_ERROR_MESSAGE);
        }

        const root = parse(html);

        const obj: QuizResponse = {};
        if (!root) {
            throw new Error(PARSE_ERROR_MESSAGE);
        }

        /** ---- API ---- */
        // get the user
        const API_TOKEN = canvasApiToken;
        if (!API_TOKEN) {
            throw new Error("No API token was present!");
        }

        const URL =
            root.getElementById("skip_navigation_link")?.getAttribute("href") ||
            "";

        // From the page, try to find which attempt number this quiz is.
        // if we can't find the attempt number, just assume it's the latest attempt

        const attemptNumberElement = root.querySelector(
            ".quiz_version.selected"
        );
        let attemptNumber = -1;
        // arrays start at 0

        if (attemptNumberElement && attemptNumberElement.innerText) {
            console.log(attemptNumberElement.innerText);
            attemptNumber =
                Number(
                    attemptNumberElement.innerText
                        .split(":")[0]
                        .replace(/\D/g, "")
                ) - 1 ?? -1;
        }

        // URL format: https://canvas.nus.edu.sg/courses/36856/quizzes/10053#content
        // courseId is the first number, quizId is the second number

        const [courseId, quizId] = URL.match(/\d+/g) || [];

        if (!courseId || !quizId) throw new Error(PARSE_ERROR_MESSAGE);

        const fetchQuizDataUrl = `${CANVAS_URL}courses/${courseId}/quizzes/${quizId}/submissions`;

        const CANVAS_HTTP_OPTIONS = {
            method: "GET",
            headers: new Headers({
                Authorization: `Bearer ${API_TOKEN}`,
                Accept: "application/json",
            }),
        };

        /**
         * Query 1: Get all submissions of this quiz.
         */
        const quizDataResponse = await fetch(
            fetchQuizDataUrl,
            CANVAS_HTTP_OPTIONS
        );

        const res = await quizDataResponse.json();
        const quizData = res["quiz_submissions"] as CanvasQuizSubmission[];

        if (res.errors) throw new Error(API_ERROR_MESSAGE);

        const quizSubmissionID = quizData[0].id;

        /**
         * Query 2: Get the information about the quiz questions
         */
        const fetchQuizQuestionsUrl = `${CANVAS_URL}quiz_submissions/${quizSubmissionID}/questions`;
        const quizSubmissionQuestionsResponse = await fetch(
            fetchQuizQuestionsUrl,
            CANVAS_HTTP_OPTIONS
        );

        const quizSubmissionQuestions = (
            await quizSubmissionQuestionsResponse.json()
        )["quiz_submission_questions"] as CanvasQuizSubmissionQuestion[];

        // @ts-expect-error
        if (quizSubmissionQuestions.errors) throw new Error(API_ERROR_MESSAGE);

        const quizSubmissionQuestionsNewFeatures = quizSubmissionQuestions.map(
            (question) => {
                return {
                    ...question,
                    annotations: [],
                    isFlagged: false,
                };
            }
        ) as QuizSubmissionQuestion[];
        //console.log(quizSubmissionQuestionsNewFeatures);

        /**
         * Query 3: Get the information about this quiz
         */
        const quizInformation = (await (
            await fetch(
                `${CANVAS_URL}courses/${courseId}/quizzes/${quizId}`,
                CANVAS_HTTP_OPTIONS
            )
        ).json()) as CanvasQuiz;

        // @ts-expect-error
        if (quizInformation.errors) throw new Error(API_ERROR_MESSAGE);

        const quizName = _quizName || quizInformation.title;

        let course = _courseName;
        if (!_courseName.trim()) {
            /**
             * Query 4: Get the course name
             * Only if user did not specify their own course name
             *
             */
            const courseInformation = (await (
                await fetch(
                    `${CANVAS_URL}courses/${courseId}`,
                    CANVAS_HTTP_OPTIONS
                )
            ).json()) as Course;

            course = courseInformation.name.trim();
        }

        /** HTML Parsing to get user answers */

        const questions = root.querySelectorAll(".question");

        if (!questions) throw new Error(PARSE_ERROR_MESSAGE);

        for (const question of questions) {
            // console.log(questionWrapper);

            if (!question) throw new Error(PARSE_ERROR_MESSAGE);
            const questionId = question.id.split("_")[1];

            const answers = question.querySelectorAll(".answer");
            const qnObj: QuestionResponse = {
                selected_answer_ids: [],
                correct_answer_ids: [],
            };
            if (
                question.classList.contains("multiple_answers_question") ||
                question.classList.contains("multiple_choice_question") ||
                question.classList.contains("true_false_question")
            ) {
                for (const answer of answers) {
                    const answerId = answer.id.split("_")[1];
                    const isSelected =
                        answer.classList.contains("selected_answer");
                    const isCorrect =
                        answer.classList.contains("correct_answer");

                    if (isSelected)
                        qnObj.selected_answer_ids!.push(Number(answerId));
                    if (isCorrect)
                        qnObj.correct_answer_ids!.push(Number(answerId));
                }
            }

            // This is different from fill_in_multiple_blanks_question as there is no `.selected_answer` div
            if (
                question.classList.contains("short_answer_question") ||
                question.classList.contains("essay_question") ||
                question.classList.contains("numerical_question")
            ) {
                // TODO: check this
                const answerInputElement = question.querySelector("input");
                let answerText = "";
                if (answerInputElement)
                    answerText = answerInputElement.getAttribute("value") || "";
                else
                    answerText =
                        question.querySelector(".quiz_response_text")
                            ?.innerText || "";
                // console.log(answerInput);
                qnObj.answer_text = [answerText || ""];

                // const isCorrect =
                //     answer.classList.contains("correct_answer");
                // get the answers, if there are any

                if (question.classList.contains("short_answer_question")) {
                    const correctAnswers =
                        question.querySelectorAll(".correct_answer");
                    let correctAnswerArray = [];
                    for (const correctAnswer of correctAnswers) {
                        const correctAnswerText =
                            correctAnswer.querySelector(
                                ".answer_text"
                            )?.innerText;
                        if (correctAnswerText)
                            correctAnswerArray.push(correctAnswerText);
                    }
                    qnObj.correct_answer_text = correctAnswerArray;
                } else if (question.classList.contains("essay_question")) {
                    const correctAnswers =
                        question.querySelectorAll(".correct_answer");
                    let correctAnswerArray = [];
                    for (const correctAnswer of correctAnswers) {
                        const correctAnswerText =
                            correctAnswer.querySelector(
                                ".answer_text"
                            )?.innerText;
                        if (correctAnswerText)
                            correctAnswerArray.push(correctAnswerText);
                    }
                    qnObj.correct_answer_text = correctAnswerArray;
                } else if (question.classList.contains("numerical_question")) {
                    const correctAnswers =
                        question.querySelectorAll(".correct_answer");
                    let correctAnswerArray = [];
                    for (const correctAnswer of correctAnswers) {
                        // todo: we only deal with numerical exact answers for now
                        const correctAnswerText =
                            correctAnswer.querySelector(
                                ".numerical_exact_answer"
                            )?.innerText ||
                            correctAnswer.querySelector(
                                ".numerical_precision_answer"
                            )?.innerText ||
                            correctAnswer.querySelector(
                                ".numerical_range_answer"
                            )?.innerText;
                        if (correctAnswerText)
                            correctAnswerArray.push(correctAnswerText);
                    }
                    qnObj.correct_answer_text = correctAnswerArray;
                }
            }

            // TODO: support this in futures
            // if (
            //     question.classList.contains(
            //         "fill_in_multiple_blanks_question"
            //     )
            // ) {
            //     const inputtedAnswers =
            //         question.querySelectorAll(".selected_answer");

            //     const answerTextArray = [];
            //     // https://stackoverflow.com/questions/6520192/how-to-get-the-text-node-of-an-element
            //     for (const inputtedAnswer of inputtedAnswers) {
            //         if (inputtedAnswer.childNodes.length < 2) continue;
            //         answerTextArray.push(
            //             inputtedAnswer.childNodes[1].textContent
            //                 .replaceAll("\n", "")
            //                 .trim()
            //         );
            //     }
            //     qnObj.answer_text = answerTextArray;

            //     const correctAnswers =
            //         question.querySelectorAll(".correct_answer");
            //     let correctAnswerArray = [];
            //     for (const correctAnswer of correctAnswers) {
            //         if (correctAnswer.childNodes.length < 2) continue;
            //         correctAnswerArray.push(
            //             correctAnswer.childNodes[1].textContent
            //                 .replaceAll("\n", "")
            //                 .trim()
            //         );
            //     }
            //     qnObj.correct_answer_text = correctAnswerArray;
            // }
            const pointElement = question.querySelector(".user_points");

            if (!pointElement) throw new Error(PARSE_ERROR_MESSAGE);
            const [yourScore, totalScore] = pointElement.innerText
                .replace("pts", "")
                .split(" / ")
                .map((s) => s.trim())
                .map(Number);
            if (yourScore === totalScore) {
                qnObj.correct_answer_ids = qnObj.selected_answer_ids;
                qnObj.correct_answer_text = qnObj.answer_text;
            }
            qnObj.your_score = Number.isNaN(yourScore) ? -1 : yourScore;
            qnObj.total_score = totalScore;

            obj[Number(questionId)] = qnObj;
        }

        // console.log(JSON.stringify(obj, null, 2));

        const quizAttempt: QuizAttempt = {
            questions: quizSubmissionQuestionsNewFeatures.sort(
                (a, b) => a.position - b.position
            ),
            selectedOptions: obj,
            submission:
                quizData[attemptNumber] || quizData.at(-1) || quizData[0], // note: take the latest attempt. todo: get the attempt number instead
            quizName,
            course,
            userUid: uid,
        };
        console.log(quizAttempt.questions[0]);

        const quiz = await create(quizAttempt, quizInformation);

        const data = { quizAttempt, quiz };
        return NextResponse.json(data);

        // const formData = await request.formData();
        // console.log(request.body?.getReader());
        // const reader = await request.text();
        // console.log(reader)
        // console.log(formData.get("file"));
        // const file = formData.get("file");

        // if (!file) {
        //     return console.log("error: no file");
        // }

        // // https://stackoverflow.com/questions/71090990/typescript-property-name-does-not-exist-on-type-formdataentryvalue
        // if (file instanceof File) {
        //     const html = await file.text();
        //     const root = parse(html);

        //     console.log(root.firstChild);
        // } else {
        //     console.log("not a file");
        // }

        // const res = await request.json();
        // console.log({ request });
    } catch (e: any) {
        console.log(e);
        if (e.message === "You have already submitted this attempt!") {
            return NextResponse.json(null, {
                status: 409,
                statusText: e,
            });
        }

        if (e.message) {
            return NextResponse.json(null, {
                status: 400,
                statusText: e.message,
            });
        }
        return NextResponse.json(null, {
            status: 400,
            statusText:
                "Invalid HTML File! Please ensure you have the correct HTML file of the quiz.",
        });
    }
}
