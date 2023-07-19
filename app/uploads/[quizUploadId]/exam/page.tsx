"use client";
import { useQuizContainer } from "@/app/providers";
import { ExamAnswerList } from "@/components/Exam/ExamComponent";
import {
    create,
    getQuizUpload,
} from "@/firebase/database/repositories/uploads";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "@/lib/constants";
import { hydrateSelectedOptions } from "@/lib/functions";
import {
    CanvasQuizSubmission,
    QuestionResponse,
    Quiz,
    QuizAttempt,
    QuizResponse,
} from "@/types/canvas";
import {
    Tag,
    Stack,
    Flex,
    Heading,
    Divider,
    Button,
    Box,
    useColorModeValue,
} from "@chakra-ui/react";

import { useParams, useSearchParams } from "next/navigation";
import router from "next/router";
import { useEffect, useMemo, useState } from "react";

/**
 * Exam page
 *
 */
export default function Page() {
    // the ongoing selected options
    const [selectedOptions, setSelectedOptions] = useState<QuizResponse>({});

    const searchParams = useSearchParams();
    const params = useParams();
    const { quizzes, setQuiz } = useQuizContainer();

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const questionBgColor = useColorModeValue("white", "gray.800");

    const quizUploadId = params.quizUploadId;
    const quiz:
        | (Quiz & {
              id: string;
          })
        | undefined = useMemo(
        () => quizzes.filter((quiz) => quiz.id === quizUploadId)[0],
        [quizzes, quizUploadId]
    );

    const [examQuiz, setExamQuiz] = useState<Quiz & { id: string }>(quiz);

    // fetch quiz incase this is not this user's quiz
    useEffect(() => {
        if (!quiz) {
            getQuizUpload(quizUploadId)
                .then((data) => {
                    setQuiz(data);
                    setExamQuiz(data);
                })
                .catch(() => {
                    router.push("/");
                });
        }
    }, [quizUploadId, quiz, setQuiz]);

    // TODO: ensure error handling
    const numQuestions =
        parseInt(
            searchParams.get("num") || examQuiz?.questions.length.toString()
        ) || examQuiz?.questions.length;
    const timeLimit = searchParams.get("timelimit") || -1;

    const answers = examQuiz?.quizAnswers;

    // start from -10
    const previousCustomAttempts =
        examQuiz?.submissions.filter((submission) => submission.attempt < 0)
            .length ?? 0;
    const newSubmissionAttemptNumber = -10 - previousCustomAttempts;

    const newSubmission: CanvasQuizSubmission = {
        id: newSubmissionAttemptNumber,
        quiz_id: parseInt(examQuiz?.id),
        user_id: parseInt(examQuiz?.userUid),
        submission_id: newSubmissionAttemptNumber,
        started_at: new Date().toString(),
        finished_at: "",
        end_at: "",
        attempt: newSubmissionAttemptNumber,
        extra_attempts: 0,
        extra_time: 0,
        manually_unlocked: true,
        time_spent: 0,
        score: -1,
        score_before_regrade: -1,
        kept_score: -1,
        fudge_points: -1,
        has_seen_results: false,
        workflow_state: "untaken",
        overdue_and_needs_submission: false,
        quiz_points_possible: numQuestions,
    };

    // const newQuizAttempt: QuizAttempt &{id: string} = structuredClone({
    //     ...quiz,
    // })

    const allQuestions = examQuiz?.questions || [];

    // given the number of questions, get a random subset of questions
    const qns = useMemo(
        () =>
            allQuestions
                .sort(() => Math.random() - Math.random())
                .slice(0, numQuestions),
        [allQuestions, numQuestions]
    );

    console.log({ selectedOptions });

    const submitCustomQuiz = async () => {
        const quizAttempt: QuizAttempt = {
            ...examQuiz,
            submission: newSubmission,
            selectedOptions: hydrateSelectedOptions(selectedOptions, answers),
        };

        console.log({ quizAttempt });
        create(quizAttempt, examQuiz.quizInfo)
            .then(() => {
                console.log("created quiz");
            })
            .catch((e) => {
                console.log(e);
            });
    };

    if (!quiz) return <>Loading...</>;
    return (
        <Flex
            minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
            // mt={NAVBAR_HEIGHT}
            px={{ base: 0, md: 6 }}
        >
            <Stack
                spacing={6}
                flexGrow={1}
                ml={{ base: 0, md: SIDEBAR_WIDTH }}
                p={4}
                bgColor={bgColor}
                borderRadius="xl"
                mt={6}
            >
                <Box mr={2} mb={2}>
                    <Tag colorScheme={"teal"}>
                        Total questions: {numQuestions}
                    </Tag>
                </Box>
                <Box
                    dangerouslySetInnerHTML={{
                        __html: quiz.quizInfo.description,
                    }}
                />
                {/* <Grid
                gridTemplateColumns={{
                    base: "1fr",
                    md: "200px 1fr",
                }}
            >
                <GridItem p={5}> */}
                <Stack>
                    <Flex justifyContent={"space-between"} alignItems="center">
                        <Heading fontSize="xl">
                            Attempt #{newSubmission.attempt}
                        </Heading>
                        <Flex></Flex>
                    </Flex>
                    <Stack spacing="10">
                        {qns.map((question, i) => (
                            <Stack
                                key={i}
                                alignItems="stretch"
                                borderWidth="1px"
                                borderRadius="md"
                                padding="4"
                                bgColor={questionBgColor}
                            >
                                <Heading
                                    fontSize="lg"
                                    alignItems={"center"}
                                    display="flex"
                                    justifyContent={"space-between"}
                                >
                                    <div> Question {i + 1} </div>
                                </Heading>
                                <div
                                    className="question-text"
                                    dangerouslySetInnerHTML={{
                                        __html: question.question_text,
                                    }}
                                />
                                <Divider />
                                <ExamAnswerList // this is the correct answer
                                    // questionType={question.question_type}
                                    // answers={question.answers}
                                    question={question}
                                    selectedOptions={selectedOptions}
                                    setSelectedOptions={setSelectedOptions}
                                />
                                {/* <Box mt={3}>
                                         <AnswerList
                                            questionType={
                                                question.question_type
                                            }
                                            answers={question.answers}
                                            selectedOptions={quizResponse}
                                            show_correct_answers={
                                                quiz.quizInfo
                                                    .show_correct_answers
                                            }
                                        /> *
                                    </Box> */}
                            </Stack>
                        ))}
                    </Stack>
                    <Button
                        onClick={() => {
                            // TODO : calculate total marks
                            // create(newQuizAttempt, quiz.quizInfo);
                            // setIsExamMode(false);
                            // router.refresh();
                            submitCustomQuiz();
                        }}
                        colorScheme="teal"
                    >
                        Submit Quiz
                    </Button>
                </Stack>
                {/* </GridItem>
            </Grid> */}
            </Stack>{" "}
        </Flex>
    );
}
