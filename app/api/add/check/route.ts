import { db } from "@/firebase/database";
import { create } from "@/firebase/database/repositories/uploads";
import { findByExtensionToken } from "@/firebase/database/repositories/users";
import { COLLECTION_NAME } from "@/lib/constants";
import {
    CanvasQuiz,
    Course,
    QuestionResponse,
    QuizAttempt,
    QuizResponse,
    CanvasQuizSubmission,
    CanvasQuizSubmissionQuestion,
    QuizSubmissionQuestion,
    Quiz,
} from "@/types/canvas";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
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

const CANVAS_URL = process.env.NEXT_PUBLIC_CANVAS_URL;

const PARSE_ERROR_MESSAGE = "Error parsing HTML!";
const API_ERROR_MESSAGE =
    "Error accessing the Canvas API! Check if your Canvas token is valid.";
//`https://canvas.instructure.com/api/v1/`;

// https://github.com/vercel/next.js/discussions/39957

interface ICheckBody {
    quizName: string;
    attemptNum: number;
    canvasApiToken: string;
    extensionToken: string;
}
export async function POST(request: Request) {
    // todo: error handling
    try {
        const body: ICheckBody = await request.json();

        const { quizName, attemptNum, canvasApiToken, extensionToken } = body;

        // check if user exists
        const user = await findByExtensionToken(extensionToken);
        if (!user) {
            return NextResponse.json(
                {
                    message:
                        "User not found! Please ensure you have the correct extension token.",
                    canAdd: false,
                },
                {
                    status: 400,
                    statusText:
                        "User not found! Please ensure you have the correct extension token.",
                }
            );
        }

        // check if quiz exists and attempt exists (already submitted)
        const userUid = user.uid;
        const existingQuizQuery = query(
            collection(db, COLLECTION_NAME),
            where("quizName", "==", quizName),
            where("userUid", "==", userUid)
        );

        const existingSnapshot = await getDocs(existingQuizQuery);
        //console.log("existingSnap :" + existingSnapshot);
        if (existingSnapshot.size === 0) {
            // doesn't exist yet, we can consider it good
            return NextResponse.json({
                canAdd: true,
            });
        } else {
            // check if the attempt number if added
            const hasAdded = existingSnapshot.docs.some((doc) => {
                const data = doc.data() as Quiz;
                return data.submissions.some(
                    (submission) => submission.attempt === attemptNum
                );
            });

            if (hasAdded) {
                // already added this attempt
                return NextResponse.json(
                    {
                        message:
                            "This attempt has already been added! Please try again with a different attempt.",
                        quizId: existingSnapshot.docs[0].id,
                        canAdd: false,
                    },
                    {
                        status: 400,
                        statusText:
                            "This attempt has already been added! Please try again with a different attempt.",
                    }
                );
            }

            // doesn't exist yet, we can consider it good
            return NextResponse.json({
                canAdd: true,
            });
        }
    } catch (e: any) {
        console.log(e);

        return NextResponse.json(null, {
            status: 400,
            statusText:
                "Error checking if quiz exists! Please try again later.",
        });
    }
}
