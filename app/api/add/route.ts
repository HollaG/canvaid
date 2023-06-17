import { create } from "@/firebase/database/repositories/uploads";
import {
    QuestionResponse,
    QuizAttempt,
    QuizResponse,
    QuizSubmission,
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
}
export interface IAddMultiBody {
    html: string;
    quizName: string;
    course: string;
    uid: string;
    selectedOptions: QuizResponse;
    submission: QuizSubmission;
}


// https://github.com/vercel/next.js/discussions/39957
export async function POST(request: Request) {
    // todo: error handling
    try {
        console.log("POST REQUEST MADE");

        try {
            const { html, quizName, course, uid }: IAddMultiBody =
                await request.json();
            // console.log({ data });

            if (!html || !quizName) {
                return console.log("error: no data");
            }

            const root = parse(html);

            const obj: QuizResponse = {};
            if (!root) {
                return console.log("NO ROOT");
            }
            const questions = root.querySelectorAll(".question");

            if (!questions) return console.log("NO QUESTIONS");
            // console.log(questions);
            for (const question of questions) {
                // console.log(questionWrapper);

                if (!question) return console.log("NO QUESTION");
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

                if (question.classList.contains("short_answer_question")) {
                    // TODO: check this
                    const answerInput = (
                        question.querySelector(
                            "input"
                        ) as unknown as HTMLInputElement
                    ).getAttribute("value");

                    // console.log(answerInput);
                    qnObj.answer_text = answerInput || "";
                }

                const pointElement = question.querySelector(".user_points");

                if (!pointElement) return console.log("NO POINT ELEMENT");
                const [yourScore, totalScore] = pointElement.innerText
                    .split(" ")
                    .filter(Number)
                    .map(Number);

                if (yourScore === totalScore) {
                    qnObj.correct_answer_ids = qnObj.selected_answer_ids;
                }
                qnObj.your_score = yourScore;
                qnObj.total_score = totalScore;
                obj[Number(questionId)] = qnObj;
            }

            // console.log(JSON.stringify(obj, null, 2));

            // query Canvas API to get the quiz questions + quiz attempt;
            // TODO: put the API token in the database
            const API_TOKEN = process.env.NEXT_PUBLIC_CANVAS_TEST_TOKEN;

            const URL =
                root
                    .getElementById("skip_navigation_link")
                    ?.getAttribute("href") || "";

            // console.log(URL);

            // From the page, try to find which attempt number this quiz is.
            // if we can't find the attempt number, just assume it's the latest attempt
            // TODO: this doesn't matter FOR NOW!
            const attemptNumberElement = root.querySelector(
                ".quiz_version.selected"
            );
            let attemptNumber = -1;
            if (attemptNumberElement) {
                attemptNumber =
                    Number(
                        attemptNumberElement.innerText
                            .split(":")[0]
                            .replace(/\D/g, "")
                    ) || -1;
            }

            // URL format: https://canvas.nus.edu.sg/courses/36856/quizzes/10053#content
            // courseId is the first number, quizId is the second number
            const [courseId, quizId] = URL.match(/\d+/g) || [];

            // console.log(API_TOKEN);
            const fetchQuizDataUrl = `https://canvas.instructure.com/api/v1/courses/${courseId}/quizzes/${quizId}/submissions`;
            // console.log({ fetchUrl: fetchQuizDataUrl });

            const CANVAS_HTTP_OPTIONS = {
                method: "GET",
                headers: new Headers({
                    Authorization: `Bearer ${API_TOKEN}`,
                    Accept: "application/json",
                }),
            };

            const quizDataResponse = await fetch(
                fetchQuizDataUrl,
                CANVAS_HTTP_OPTIONS
            );

            // console.log(await quizDataResponse.json());

            const quizData = (await quizDataResponse.json())[
                "quiz_submissions"
            ] as QuizSubmission[];
            //console.log({ quizData });
            const quizSubmissionID = quizData[0].id;

            const fetchQuizQuestionsUrl = `https://canvas.instructure.com/api/v1/quiz_submissions/${quizSubmissionID}/questions`;
            const quizSubmissionQuestionsResponse = await fetch(
                fetchQuizQuestionsUrl,
                CANVAS_HTTP_OPTIONS
            );

            const quizSubmissionQuestions = (
                await quizSubmissionQuestionsResponse.json()
            )["quiz_submission_questions"] as QuizSubmissionQuestion[];

            const quizAttempt: QuizAttempt = {
                questions: quizSubmissionQuestions.sort(
                    (a, b) => a.position - b.position
                ),
                selectedOptions: obj,
                submission: quizData[0], // TODO: change this to the attempt number
                quizName,
                course,
                userUid: uid,
            };
            // in case the question takes in text input, we need to manually set the score to 0 as it's not in the response
            for (let all in quizAttempt.selectedOptions) {
                if( quizAttempt.selectedOptions[all].total_score == undefined) {
                    quizAttempt.selectedOptions[all].total_score = 0;

                }
            }
            //console.log( quizAttempt.selectedOptions[170137162] );

            await create(quizAttempt);

            return NextResponse.json(quizAttempt);
        } catch (e) {
            console.log("ERROR!");
            console.log(e);
        }

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
    } catch (e) {
        console.log(e);
    }
}
