"use client";
import { useQuizContainer, useSidebarContainer } from "@/app/providers";
import CourseInfo from "@/components/Display/CourseInfo";
import { ExamAnswerList } from "@/components/Exam/ExamAnswerList";
import {
    create,
    getQuizUpload,
} from "@/firebase/database/repositories/uploads";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "@/lib/constants";
import {
    calculateTotalScore,
    convertCustomAttemptNumber,
    getExaminableQuestions,
    hydrateSelectedOptions,
} from "@/lib/functions";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import {
    CanvasQuizSubmission,
    Quiz,
    QuizAttempt,
    QuizSubmissionQuestion,
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
    useToast,
    Center,
} from "@chakra-ui/react";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * Exam page
 *
 */
export default function Page() {
    // the ongoing selected options
    //const [selectedOptions, setSelectedOptions] = useState<QuizResponse>({});
    const { isOpenSidebar } = useSidebarContainer();

    const searchParams = useSearchParams();
    const params = useParams();
    const {
        quizzes,
        setQuiz,
        selectedOptions,
        setSelectedOptions,
        setExamQuestionList,
    } = useQuizContainer();

    const toast = useToast();
    const router = useRouter();

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
    useEffect(() => {
        // reset selected options to nil when quiz changes
        setSelectedOptions({});
        setExamQuestionList([]);
    }, [setSelectedOptions, setExamQuestionList]);

    // fetch quiz incase this is not this user's quiz
    useEffect(() => {
        if (!examQuiz) {
            getQuizUpload(quizUploadId)
                .then((data) => {
                    setQuiz(data);
                    setExamQuiz(data);
                })
                .catch(() => {
                    router.push("/");
                });
        }
    }, [quizUploadId, examQuiz, setQuiz, router]);

    // calculate the questions to be examined
    // we expect `num` to ALWAYS be in the URL. if not in URL, default to all qns
    const [numQuestions, setNumQuestions] = useState<number>(
        parseInt(searchParams.get("num") || "0")
    );
    const [qns, setQns] = useState<QuizSubmissionQuestion[]>([]);

    const [isRandom, setIsRandom] = useState<boolean>(
        searchParams.get("random") === "true" || false
    );

    const [examLength, setExamLength] = useState<number>(
        parseInt(searchParams.get("length") || "0")
    );

    useEffect(() => {
        const examinableQuestions = getExaminableQuestions(examQuiz);

        let qns = examinableQuestions.sort(() =>
            !isRandom ? 0 : Math.random() - Math.random()
        );

        if (numQuestions > 0) {
            qns = qns.slice(0, numQuestions);
        }
        setQns(qns);
        setExamQuestionList(qns);
    }, [examQuiz, numQuestions, isRandom, setExamQuestionList]);

    // TODO: ensure error handling

    const answers = examQuiz?.quizAnswers;

    // start from -10
    const previousCustomAttempts =
        examQuiz?.submissions.filter((submission) => submission.attempt < 0)
            .length ?? 0;
    const newSubmissionAttemptNumber = -10 - previousCustomAttempts;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitCustomQuiz = async () => {
        setIsSubmitting(true);
        const hydratedSelectedOptions = hydrateSelectedOptions(
            selectedOptions,
            answers
        );

        const newSubmission: CanvasQuizSubmission = {
            id: newSubmissionAttemptNumber,
            quiz_id: parseInt(examQuiz?.id),
            user_id: parseInt(examQuiz?.userUid),
            submission_id: newSubmissionAttemptNumber,
            started_at: new Date().toString(),
            finished_at: new Date().toString(),
            end_at: new Date().toString(),
            attempt: newSubmissionAttemptNumber,
            extra_attempts: 0,
            extra_time: 0,
            manually_unlocked: true,
            time_spent: 0,
            score: calculateTotalScore(hydratedSelectedOptions),
            score_before_regrade: -1,
            kept_score: -1,
            fudge_points: -1,
            has_seen_results: false,
            workflow_state: "untaken",
            overdue_and_needs_submission: false,
            quiz_points_possible: numQuestions || qns.length,
        };
        const quizAttempt: QuizAttempt = {
            ...examQuiz,
            submission: newSubmission,
            selectedOptions: hydratedSelectedOptions,
        };

        create(quizAttempt, examQuiz.quizInfo)
            .then((newQuiz) => {
                toast({
                    ...SUCCESS_TOAST_OPTIONS,
                    title: "Quiz submitted!",
                });

                router.push(
                    `/uploads/${quizUploadId}?submission=${
                        newQuiz.submissions.length - 1
                    }`
                );
            })
            .catch((e) => {
                console.log(e);
                toast({
                    ...ERROR_TOAST_OPTIONS,
                    title: "Error submitting quiz",
                    description: e.message,
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (!examQuiz) return <>Loading...</>;
    return (
        <Flex
            minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
            // mt={NAVBAR_HEIGHT}
            px={{ base: 0, md: 6 }}
        >
            <Stack
                spacing={6}
                flexGrow={1}
                ml={
                    isOpenSidebar
                        ? { base: 0, md: SIDEBAR_WIDTH }
                        : { base: 0, md: "60px" }
                }
                p={4}
                bgColor={bgColor}
                borderRadius="xl"
                mt={6}
            >
                <CourseInfo
                    courseCode={quiz.course.split(" ")[0]}
                    courseName={quiz.course.split(" ").slice(1).join(" ")}
                />
                <Heading> {quiz.quizName} </Heading>
                <Box mr={2} mb={2}>
                    <Tag colorScheme={"teal"}>
                        Total questions: {numQuestions || qns.length}
                    </Tag>
                </Box>
                <Box
                    dangerouslySetInnerHTML={{
                        __html: examQuiz.quizInfo.description,
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
                            Attempt #
                            {convertCustomAttemptNumber(
                                newSubmissionAttemptNumber
                            )}
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
                                id={`question-${i + 1}`}
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
                            </Stack>
                        ))}
                    </Stack>
                    <Center mt={3}>
                        <Button
                            size="lg"
                            onClick={submitCustomQuiz}
                            colorScheme="orange"
                            // Note, this is just checking more # answered than actual
                            // because test case is difficult to test
                            // because of randomness
                            isDisabled={
                                Object.keys(selectedOptions).length <
                                (numQuestions || qns.length)
                            }
                            isLoading={isSubmitting}
                            type="submit"
                            name="submit"
                        >
                            Submit Quiz
                        </Button>
                    </Center>
                </Stack>
                {/* </GridItem>
            </Grid> */}
            </Stack>{" "}
        </Flex>
    );
}
