"use client";
import {
    getQuizUpload,
    addQuizQuestionAnnotation,
    updateQuizQuestionFlag,
    deleteAttempt,
    deleteQuiz,
} from "@/firebase/database/repositories/uploads";
import {
    NAVBAR_HEIGHT,
    PAGE_CONTAINER_SIZE,
    SIDEBAR_WIDTH,
} from "@/lib/constants";
import {
    Answer,
    QuestionResponse,
    Quiz,
    QuizResponse,
    CanvasQuizSubmissionQuestion,
    QuizSubmissionQuestion,
    QuizAttempt,
    CanvasQuizSubmission,
} from "@/types/canvas";
import {
    Input,
    IconButton,
    Badge,
    Box,
    Button,
    Checkbox,
    CheckboxGroup,
    Container,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    Radio,
    RadioGroup,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
    FormErrorMessageProps,
    useColorModeValue,
    Tooltip,
    useDisclosure,
    Alert,
    AlertIcon,
    AlertTitle,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";

import {
    useParams,
    useRouter,
    useSelectedLayoutSegment,
} from "next/navigation";
import {
    useEffect,
    useState,
    FormEvent,
    Dispatch,
    SetStateAction,
    useMemo,
} from "react";
import { FaRegFlag, FaFlag } from "react-icons/fa";
import { DeleteAnnotationButton } from "@/components/DeleteButton";
import Sidebar from "@/components/Sidebar/Sidebar";
import CourseInfo from "@/components/Display/CourseInfo";
import { useAuthContainer, useQuizContainer } from "@/app/providers";
import useSidebar from "@/hooks/useSidebar";
import { getUploads } from "@/lib/functions";
import QuizContainer from "@/components/PageWrappers/Quiz";
import { DeleteIcon } from "@chakra-ui/icons";
import CustomAlertDialog from "@/components/Alert/CustomAlertDialog";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import { parse } from "path";
import { create } from "@/firebase/database/repositories/uploads";
// export default async function Page({
//     params,
//     searchParams,
// }: {
//     params: { quizUploadId: string };
//     searchParams?: { [key: string]: string | string[] | undefined };
// }) {
//     const uploadId = params.quizUploadId;

//     const data = await getQuizUpload(uploadId);

//     return <QuizContainer loadedQuiz={data} />;
// }

/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const params = useParams();
    const dataId = params.quizUploadId;

    const { quizzes, setQuiz } = useQuizContainer();
    const [questionInputs, setQuestionInputs] = useState<string>("");

    const authCtx = useAuthContainer();
    const user = authCtx.user;

    const router = useRouter();
    const quiz = quizzes.filter((quiz) => quiz.id === dataId)[0];

    const toast = useToast();

    const [pageQuiz, setPageQuiz] = useState(
        quizzes.filter((quiz) => quiz.id === dataId)[0]
    );

    // fetch quiz incase this is not this user's quiz
    useEffect(() => {
        if (!quiz) {
            getQuizUpload(dataId)
                .then((data) => {
                    setQuiz(data);
                    setPageQuiz(data);
                })
                .catch(() => {
                    router.push("/");
                });
        }
    }, [dataId, quiz, setQuiz]);

    const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);
    //console.log(quiz);

    const getQuestionsForAttempt = (selectedAttemptIndex: number) => {
        // note: usually the qnID is a number, but Object.keys returns a string[]
        const qnIds = Object.keys(
            quiz?.selectedOptions[selectedAttemptIndex] || {}
        );
        const qns = quiz?.questions.filter((qn) =>
            qnIds.includes(qn.id.toString())
        );
        // const nestedArrayOfAnnotations = qns?.map((qn) => qn.annotations) || []
        // setAnnotations(nestedArrayOfAnnotations)

        return qns || [];
    };

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const questionBgColor = useColorModeValue("white", "gray.800");

    // For deleting the whole quiz
    const alertDeleteDisclosure = useDisclosure();

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
    const confirmDelete = () => {
        // delete quiz
        // delete all attempts
        if (!user) return;
        setIsDeleting(true);
        deleteQuiz(quiz.id, user.uid)
            .then(() => {
                // redirect to home page
                router.push("/");
                toast({
                    ...SUCCESS_TOAST_OPTIONS,
                    title: "Quiz deleted!",
                });
            })
            .catch((e) => {
                setDeleteErrorMessage(e);
            })
            .finally(() => {
                setIsDeleting(false);
                alertDeleteDisclosure.onClose();
            });
    };

    // For deleting an attempt
    const attemptDeleteDisclosure = useDisclosure();
    const [isDeletingAttempt, setIsDeletingAttempt] = useState(false);
    const [isExamMode, setIsExamMode] = useState(false);

    const [attemptNumberToDelete, setAttemptNumberToDelete] = useState(-1);
    const confirmDeleteAttempt = () => {
        // delete attempt
        if (!user || attemptNumberToDelete === -1) return;
        setIsDeletingAttempt(true);
        deleteAttempt(quiz.id, user.uid, attemptNumberToDelete)
            .then((res) => {
                if (res.status === "deleted") {
                    // redirect
                    router.push("/");
                    toast({
                        ...SUCCESS_TOAST_OPTIONS,
                        title: "Attempt deleted!",
                        description:
                            "Your quiz has been deleted as it has no more uploaded attempts.",
                    });
                } else {
                    // remove attempt from quiz
                    const data = res.data;

                    setQuiz(data);
                    toast({
                        ...SUCCESS_TOAST_OPTIONS,
                        title: "Attempt deleted!",
                    });
                }
            })
            .catch((e) => {
                toast({
                    ...ERROR_TOAST_OPTIONS,
                    title: "Error deleting attempt",
                    description: e,
                });
            })
            .finally(() => {
                setIsDeletingAttempt(false);
                attemptDeleteDisclosure.onClose();
            });
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [numQn, setNumQn] = useState("");
    let numOfAvailableQnsWithCorrectAnswers = 0;
    let correctAnswerWithQuestions: QuizResponse[] = [];
    if (quiz.quizInfo.show_correct_answers) {
        numOfAvailableQnsWithCorrectAnswers = quiz.questions.length;
        for (let i = 0; i < quiz.questions.length; i++) {
            const questionID = quiz.questions[i].id;
            let foundCorrect = false;
            let j = 0;
            while (j < quiz.selectedOptions.length && !foundCorrect) {
                const attempt = quiz.selectedOptions[j]; // jh submission
                if (attempt[questionID]) {
                    const questionResponse = attempt[questionID];
                    questionResponse.selected_answer_ids = [];
                    questionResponse.your_score = 0; // might need to change to -1
                    correctAnswerWithQuestions.push({
                        [questionID]: questionResponse,
                    });
                    foundCorrect = true;
                }
                j = j + 1;
            }
        }
    } else {
        for (let i = 0; i < quiz.questions.length; i++) {
            const questionID = quiz.questions[i].id;
            // check through all the attempts whether there's a correct answer
            let j = 0;
            let foundCorrect = false;
            while (j < quiz.selectedOptions.length && !foundCorrect) {
                const attempt = quiz.selectedOptions[j]; // jh submission
                if (attempt[questionID]) {
                    const questionResponse = attempt[questionID];
                    if (
                        availableQuestionsWithCorrectAnswers(questionResponse)
                    ) {
                        numOfAvailableQnsWithCorrectAnswers++;
                        foundCorrect = true;
                        correctAnswerWithQuestions.push({
                            [questionID]: questionResponse,
                        });
                    }
                }
                j = j + 1;
            }
        }
    }

    return (
        // <Container maxW={PAGE_CONTAINER_SIZE} mt={NAVBAR_HEIGHT} pt={3}>
        <Flex
            minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
            // mt={NAVBAR_HEIGHT}
            px={{ base: 0, md: 6 }}
        >
            <CustomAlertDialog
                {...alertDeleteDisclosure}
                bodyText={`Are you sure you want to delete this quiz? All attempts will be deleted. 
                
                This action is not reversible.`}
                headerText="Delete quiz"
                ConfirmButton={
                    <Button
                        onClick={confirmDelete}
                        isLoading={isDeleting}
                        colorScheme="red"
                    >
                        Delete
                    </Button>
                }
            />
            <CustomAlertDialog
                {...attemptDeleteDisclosure}
                bodyText={`Are you sure you want to delete Attempt #${attemptNumberToDelete}?  
                
                This action is not reversible.`}
                headerText={`Delete Attempt #${attemptNumberToDelete}`}
                ConfirmButton={
                    <Button
                        onClick={confirmDeleteAttempt}
                        isLoading={isDeletingAttempt}
                        colorScheme="red"
                    >
                        Delete
                    </Button>
                }
            />
            {quiz ? (
                <Stack
                    spacing={6}
                    flexGrow={1}
                    ml={{ base: 0, md: SIDEBAR_WIDTH }}
                    p={4}
                    bgColor={bgColor}
                    borderRadius="xl"
                    mt={6}
                >
                    {/* <Box>
                    <Text
                        ml={2}
                        textColor={useColorModeValue("gray.600", "gray.400")}
                    >
                        {quiz.course}
                    </Text>
                    <Heading>{quiz.quizName}</Heading>
                </Box> */}
                    {deleteErrorMessage && (
                        <Alert status="error">
                            <AlertIcon />
                            <AlertTitle>{deleteErrorMessage}</AlertTitle>
                        </Alert>
                    )}
                    <CourseInfo
                        courseCode={quiz.course.split(" ")[0]}
                        courseName={quiz.course.split(" ").slice(1).join(" ")}
                        DeleteButton={
                            <Tooltip label="Delete this quiz">
                                <Button
                                    colorScheme={"red"}
                                    aria-role="Delete"
                                    onClick={alertDeleteDisclosure.onOpen}
                                    isLoading={isDeleting}
                                    size="sm"
                                >
                                    <DeleteIcon />
                                    <Text
                                        display={{
                                            md: "unset",
                                            base: "none",
                                        }}
                                        ml={2}
                                    >
                                        Delete
                                    </Text>
                                </Button>
                            </Tooltip>
                        }
                    />
                    <Heading>{quiz.quizName}</Heading>
                    {isExamMode ? (
                        <Exam numQn={numQn} quiz={quiz} />
                    ) : (
                        <>
                            <Button onClick={onOpen}>
                                {isExamMode
                                    ? "Exit Exam Mode"
                                    : "Enter Exam Mode"}
                            </Button>
                            <Modal isOpen={isOpen} onClose={onClose}>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Modal Title</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel>
                                                Number of Questions
                                            </FormLabel>
                                            <NumberInput
                                                defaultValue={
                                                    quiz.questions.length
                                                }
                                                min={1}
                                                max={quiz.questions.length}
                                                onChange={(value) =>
                                                    setNumQn(value)
                                                }
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button
                                            colorScheme="blue"
                                            mr={3}
                                            onClick={onClose}
                                        >
                                            Go Back
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsExamMode(true)}
                                        >
                                            Start Exam Mode
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                            <Flex flexDir={"row"} flexWrap="wrap">
                                {quiz.quizInfo.show_correct_answers ? (
                                    <Box mr={2} mb={2}>
                                        <Tag colorScheme={"green"}>
                                            Correct answers are shown
                                        </Tag>
                                    </Box>
                                ) : (
                                    <Box mr={2} mb={2}>
                                        <Tag colorScheme={"red"} mr={2}>
                                            Correct answers are hidden
                                        </Tag>
                                    </Box>
                                )}
                                <Box mr={2} mb={2}>
                                    <Tag colorScheme={"teal"}>
                                        Total questions seen:{" "}
                                        {quiz.questions.length}
                                    </Tag>
                                </Box>
                            </Flex>
                            <Box
                                dangerouslySetInnerHTML={{
                                    __html: quiz.quizInfo.description,
                                }}
                            />
                            <Divider />

                            <Grid
                                gridTemplateColumns={{
                                    base: "1fr",
                                    md: "200px 1fr",
                                }}
                            >
                                <GridItem p={5}>
                                    <Stack>
                                        <Button
                                            variant={
                                                selectedAttemptIndex === -1
                                                    ? "solid"
                                                    : "outline"
                                            }
                                            colorScheme="teal"
                                            onClick={() =>
                                                setSelectedAttemptIndex(-1)
                                            }
                                        >
                                            Combined
                                        </Button>
                                        <Divider />
                                        {quiz.submissions.map(
                                            (submission, i) => (
                                                <Button
                                                    variant={
                                                        selectedAttemptIndex ===
                                                        i
                                                            ? "solid"
                                                            : "ghost"
                                                    }
                                                    colorScheme="teal"
                                                    key={i}
                                                    textAlign="left"
                                                    onClick={() =>
                                                        setSelectedAttemptIndex(
                                                            i
                                                        )
                                                    }
                                                    fontSize="sm"
                                                >
                                                    Attempt #
                                                    {submission.attempt} (
                                                    {Math.round(
                                                        submission.score * 100
                                                    ) / 100}
                                                    /
                                                    {
                                                        submission.quiz_points_possible
                                                    }
                                                    )
                                                </Button>
                                            )
                                        )}
                                    </Stack>
                                </GridItem>
                                <GridItem p={5}>
                                    {selectedAttemptIndex === -1 ? (
                                        <CombinedQuestionList
                                            quiz={quiz}
                                            setQuiz={setQuiz}
                                        />
                                    ) : (
                                        <Stack>
                                            <Flex
                                                justifyContent={"space-between"}
                                                alignItems="center"
                                            >
                                                <Heading fontSize="xl">
                                                    Attempt #
                                                    {
                                                        quiz.submissions[
                                                            selectedAttemptIndex
                                                        ].attempt
                                                    }
                                                </Heading>
                                                <Flex>
                                                    <Button
                                                        size="sm"
                                                        colorScheme={"red"}
                                                        onClick={() => {
                                                            attemptDeleteDisclosure.onOpen();
                                                            setAttemptNumberToDelete(
                                                                quiz
                                                                    .submissions[
                                                                    selectedAttemptIndex
                                                                ].attempt
                                                            );
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </Button>
                                                </Flex>
                                            </Flex>
                                            <Stack spacing="10">
                                                {getQuestionsForAttempt(
                                                    selectedAttemptIndex
                                                ).map((question, i) => (
                                                    <Stack
                                                        key={i}
                                                        alignItems="stretch"
                                                        borderWidth="1px"
                                                        borderRadius="md"
                                                        padding="4"
                                                        bgColor={
                                                            questionBgColor
                                                        }
                                                    >
                                                        <Heading
                                                            fontSize="lg"
                                                            alignItems={
                                                                "center"
                                                            }
                                                            display="flex"
                                                            justifyContent={
                                                                "space-between"
                                                            }
                                                        >
                                                            <div>
                                                                {" "}
                                                                Question {i +
                                                                    1}{" "}
                                                                <QuestionResultTag
                                                                    quiz={quiz}
                                                                    questionResponse={
                                                                        quiz
                                                                            .selectedOptions[
                                                                            selectedAttemptIndex
                                                                        ][
                                                                            question
                                                                                .id
                                                                        ]
                                                                    }
                                                                />
                                                            </div>
                                                            <FlaggingButton
                                                                question={
                                                                    question
                                                                }
                                                                quiz={quiz}
                                                                setQuiz={
                                                                    setQuiz
                                                                }
                                                            />
                                                        </Heading>
                                                        <div
                                                            className="question-text"
                                                            dangerouslySetInnerHTML={{
                                                                __html: question.question_text,
                                                            }}
                                                        />
                                                        <Divider />
                                                        <Box mt={3}>
                                                            <AnswerList
                                                                questionType={
                                                                    question.question_type
                                                                }
                                                                answers={
                                                                    question.answers
                                                                }
                                                                selectedOptions={
                                                                    quiz
                                                                        .selectedOptions[
                                                                        selectedAttemptIndex
                                                                    ] &&
                                                                    quiz
                                                                        .selectedOptions[
                                                                        selectedAttemptIndex
                                                                    ][
                                                                        question
                                                                            .id
                                                                    ]
                                                                }
                                                                show_correct_answers={
                                                                    quiz
                                                                        .quizInfo
                                                                        .show_correct_answers
                                                                }
                                                            />
                                                        </Box>
                                                        <QuestionExtras
                                                            question={question}
                                                            quiz={quiz}
                                                            setQuiz={setQuiz}
                                                        />
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    )}
                                </GridItem>
                            </Grid>
                        </>
                    )}
                </Stack>
            ) : (
                <Stack
                    spacing={6}
                    flexGrow={1}
                    ml={SIDEBAR_WIDTH}
                    p={4}
                    bgColor={bgColor}
                    borderRadius="xl"
                    mt={6}
                >
                    {" "}
                    Loading...{" "}
                </Stack>
            )}
        </Flex>

        // </Container>
    );
}
const Exam = ({
    numQn,
    quiz,
}: {
    numQn: string;
    quiz: Quiz & { id: string };
}) => {
    const updatedQuestions = [...quiz.questions];
    let updatedSelectedOptions = [...quiz.selectedOptions];
    // get all the highest SelectedOptions
    if (quiz.questions.length > parseInt(numQn)) {
        let difference = quiz.questions.length - parseInt(numQn);
        // Remove random elements from the copied array
        for (let i = 0; i < difference; i++) {
            const randomIndex = Math.floor(
                Math.random() * updatedQuestions.length
            );
            const removedQn = updatedQuestions.splice(randomIndex, 1);
            const id = removedQn[0].id;
            updatedSelectedOptions = updatedSelectedOptions.filter(
                (option) => !option.hasOwnProperty(id)
            );
        }
    }
    let minSubmissionAttempt = -1;
    for (let i = 0; i < quiz.submissions.length; i++) {
        if (quiz.submissions[i].attempt < minSubmissionAttempt) {
            minSubmissionAttempt = quiz.submissions[i].attempt;
        }
    }
    const newSubmission: CanvasQuizSubmission = {
        id: minSubmissionAttempt,
        // The ID of the Quiz the quiz submission belongs to.
        quiz_id: parseInt(quiz.id),
        // The ID of the Student that made the quiz submission.
        user_id: parseInt(quiz.userUid),
        // The ID of the Submission the quiz submission represents.
        submission_id: minSubmissionAttempt,
        // The time at which the student started the quiz submission.
        started_at: "",
        // The time at which the student submitted the quiz submission.
        finished_at: "",
        // The time at which the quiz submission will be overdue, and be flagged as a
        // late submission.
        end_at: "",
        // For quizzes that allow multiple attempts, this field specifies the quiz
        // submission attempt number.
        attempt: minSubmissionAttempt,
        // Number of times the student was allowed to re-take the quiz over the
        // multiple-attempt limit.
        extra_attempts: 0,
        // Amount of extra time allowed for the quiz submission, in minutes.
        extra_time: 0,
        // The student can take the quiz even if it's locked for everyone else
        manually_unlocked: true,
        // Amount of time spent, in seconds.
        time_spent: 0,
        // The score of the quiz submission, if graded.
        score: -1,
        // The original score of the quiz submission prior to any re-grading.
        score_before_regrade: -1,
        // For quizzes that allow multiple attempts, this is the score that will be
        // used, which might be the score of the latest, or the highest, quiz
        // submission.
        kept_score: -1,
        // Number of points the quiz submission's score was fudged by.
        fudge_points: -1,
        // Whether the student has viewed their results to the quiz.
        has_seen_results: false,
        // The current state of the quiz submission. Possible values:
        // ['untaken'|'pending_review'|'complete'|'settings_only'|'preview'].
        workflow_state: "untaken",
        // Indicates whether the quiz submission is overdue and needs submission
        overdue_and_needs_submission: false,

        quiz_points_possible: 0,
    };
    quiz.submissions.push(newSubmission);
    // no need to change the question order here
    // for (let i = 0; i < updatedQuestions.length; i++) {
    //     updatedQuestions[i].position = i + 1;
    // }
    // new quiz attempt object
    const newQuizAttempt: QuizAttempt & { id: string } = {
        ...quiz,
        submission: newSubmission,
        selectedOptions: updatedSelectedOptions,
    };
    return <></>;
};
const FlaggingButton = ({
    question,
    quiz,
    setQuiz,
}: {
    question: QuizSubmissionQuestion;
    quiz: Quiz & { id: string };
    setQuiz: (quiz: Quiz & { id: string }) => void;
}) => {
    const [isFlagged, setIsFlagged] = useState(question.isFlagged);
    const handleFlagQuestion = async (questionId: number) => {
        try {
            const updatedQuizData = await updateQuizQuestionFlag(
                quiz,
                questionId,
                !isFlagged
            );
            setQuiz(updatedQuizData);
            setIsFlagged(!isFlagged);
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <IconButton
            aria-label="flag question"
            onClick={() => {
                handleFlagQuestion(question.id);
            }}
            size="sm"
            variant="ghost"
            colorScheme={question.isFlagged ? "red" : "gray"}
        >
            <Box>{question.isFlagged ? <FaFlag /> : <FaRegFlag />}</Box>
        </IconButton>
    );
};
const QuestionExtras = ({
    question,
    quiz,
    setQuiz,
}: {
    question: QuizSubmissionQuestion;
    quiz: Quiz & { id: string };
    setQuiz: (quiz: Quiz & { id: string }) => void;
}) => {
    // const [isChatboxOpen, setIsChatboxOpen] = useState(false);
    const [newAnnotation, setNewAnnotation] = useState("");
    const handleSubmitAnnotation = async (event: FormEvent, i: number) => {
        event.preventDefault();

        try {
            const updatedQuizData = await addQuizQuestionAnnotation(
                quiz,
                i,
                newAnnotation
            );
            setQuiz(updatedQuizData);
            // Close the chatbox
            // setIsChatboxOpen(false);

            setNewAnnotation("");
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <Stack mt={4}>
            <form
                onSubmit={(event) => handleSubmitAnnotation(event, question.id)}
            >
                <Flex>
                    <Input
                        placeholder="Add a comment..."
                        type="text"
                        value={newAnnotation}
                        onChange={(e) => setNewAnnotation(e.target.value)}
                        size="sm"
                        //onBlur={() => setIsChatboxOpen(false)}
                        variant="flushed"
                    />
                    <Button
                        type="submit"
                        colorScheme={"teal"}
                        size="sm"
                        variant="ghost"
                    >
                        Submit
                    </Button>
                </Flex>
            </form>

            <Stack>
                {question.annotations.length &&
                    question.annotations.map((annotation, i) => {
                        return (
                            <>
                                <Text key={i}> {annotation.annotation}</Text>
                                <DeleteAnnotationButton
                                    ID={quiz.id}
                                    annotationID={annotation.annotationID}
                                    setQuiz={setQuiz}
                                    question={question}
                                />
                            </>
                        );
                    })}
            </Stack>
        </Stack>
    );
};

const QuestionResultTag = ({
    quiz,
    questionResponse,
}: {
    quiz: Quiz;
    questionResponse: QuestionResponse;
}) => {
    // if the question is correct
    if (questionResponse.your_score === questionResponse.total_score) {
        return (
            <Tag colorScheme="green" ml={1}>
                Correct! ({questionResponse.your_score} /{" "}
                {questionResponse.total_score})
            </Tag>
        );
        // return <Tag colorScheme="green"> Correct! </Tag>;
    }

    // if the question is incorrect
    if (questionResponse.your_score === 0) {
        // return <Tag colorScheme="red"> Incorrect! </Tag>;
        return (
            <Tag colorScheme="red" ml={1}>
                Incorrect! ({questionResponse.your_score} /{" "}
                {questionResponse.total_score}){" "}
            </Tag>
        );
    }

    // if the question is not yet graded (score = -1)
    if (questionResponse.your_score === -1) {
        return (
            <Tag colorScheme="gray" ml={1}>
                {" "}
                Not yet graded!{" "}
            </Tag>
        );
    }

    // if the question is partially answered
    if (questionResponse.your_score !== questionResponse.total_score) {
        return (
            <Tag colorScheme="yellow" ml={1}>
                Partial! ({questionResponse.your_score} /{" "}
                {questionResponse.total_score}){" "}
            </Tag>
        );
        // return <Tag colorScheme="yellow"> Partial! </Tag>;
    }

    return <Tag ml={1}> Could not parse result! </Tag>;
};

/**
 *
 * @param param0 Per-question answer list
 * @returns
 */
const AnswerList = ({
    questionType,
    answers,
    selectedOptions,
    show_correct_answers,
}: {
    questionType: string;
    answers: Answer[];
    selectedOptions: QuestionResponse;
    show_correct_answers: boolean;
}) => {
    // console.log("reredner");
    switch (questionType) {
        case "multiple_choice_question":
        case "true_false_question":
            return (
                <RadioGroup
                    value={
                        selectedOptions.selected_answer_ids?.[0].toString() ??
                        "0"
                    }
                >
                    <Stack>
                        {answers.map((answer, i) => (
                            <Flex alignItems={"center"} key={i}>
                                <Box width="100px" textAlign={"end"} mr={3}>
                                    <AnswerResultTag
                                        answer={answer}
                                        selectedOptions={selectedOptions}
                                        show_correct_answers={
                                            show_correct_answers
                                        }
                                    />
                                </Box>
                                <Radio
                                    key={i}
                                    value={answer.id.toString()}
                                    isReadOnly
                                >
                                    {" "}
                                    {answer.text ?? answer.html}{" "}
                                </Radio>
                            </Flex>
                        ))}
                    </Stack>
                </RadioGroup>
            );

        case "multiple_answers_question":
            const userSelected = selectedOptions.selected_answer_ids?.map((s) =>
                s.toString()
            ) || [""];
            return (
                <CheckboxGroup value={userSelected}>
                    <Stack spacing={4}>
                        {answers.map((answer, i) => (
                            <Flex alignItems={"center"} key={i}>
                                <Box width="100px" textAlign={"end"} mr={3}>
                                    <AnswerResultTag
                                        answer={answer}
                                        selectedOptions={selectedOptions}
                                        show_correct_answers={
                                            show_correct_answers
                                        }
                                    />
                                </Box>
                                <Checkbox
                                    key={i}
                                    value={answer.id.toString()}
                                    isReadOnly
                                >
                                    {" "}
                                    {answer.text ?? answer.html}{" "}
                                </Checkbox>
                            </Flex>
                        ))}
                    </Stack>
                </CheckboxGroup>
            );

        case "essay_question":
        case "short_answer_question":
        case "numerical_question":
            return (
                <Stack spacing={4}>
                    <Flex alignItems={"center"}>
                        {" "}
                        <Box width="100px" textAlign="end" mr={3}>
                            <AnswerResultTag
                                selectedOptions={selectedOptions}
                                show_correct_answers={show_correct_answers}
                            />
                        </Box>{" "}
                        <Box>
                            <Stack spacing={1}>
                                <Text
                                    fontWeight="semibold"
                                    textDecoration={"underline"}
                                >
                                    Your answer
                                </Text>{" "}
                                <Text>{selectedOptions.answer_text}</Text>
                            </Stack>
                        </Box>
                    </Flex>
                    {selectedOptions?.correct_answer_text && (
                        <Flex alignItems={"center"}>
                            {" "}
                            <Box width="100px" textAlign="end" mr={3}>
                                {/* <Badge colorScheme="green">Correct!</Badge> */}
                            </Box>{" "}
                            <Box>
                                <Stack spacing={1}>
                                    <Text
                                        fontWeight="semibold"
                                        textDecoration={"underline"}
                                    >
                                        Correct answer
                                        {selectedOptions?.correct_answer_text
                                            ?.length > 1
                                            ? "s"
                                            : ""}
                                    </Text>{" "}
                                    {selectedOptions.correct_answer_text?.map(
                                        (ans, i) => (
                                            <Text key={i}>{ans}</Text>
                                        )
                                    )}
                                </Stack>
                            </Box>
                        </Flex>
                    )}
                </Stack>
            );

        default:
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;
    }
};

const AnswerResultTag = ({
    selectedOptions,
    show_correct_answers,
    answer,
}: {
    selectedOptions: QuestionResponse;
    show_correct_answers: boolean;
    answer?: Answer;
}) => {
    // for qns that aren't graded yet
    if (selectedOptions.your_score === -1) {
        return <></>;
    }

    // for qns that aren't multiple choice
    if (!answer) {
        if (selectedOptions.total_score === selectedOptions.your_score) {
            return <Badge colorScheme="green"> Correct! </Badge>;
        } else {
            return <Badge colorScheme="red"> Incorrect! </Badge>;
        }
    }
    // if this option is correct but not selected
    if (
        selectedOptions.correct_answer_ids?.includes(answer.id) &&
        !selectedOptions.selected_answer_ids?.includes(answer.id)
    ) {
        return <Badge colorScheme="yellow"> Correct! </Badge>;
    }

    // if this option is correct
    if (selectedOptions.correct_answer_ids?.includes(answer.id)) {
        return <Badge colorScheme="green"> Correct! </Badge>;
    }

    // if this option is incorrect and we selected it and we know for sure because show_correct_answers is true
    if (
        show_correct_answers &&
        !selectedOptions.correct_answer_ids?.includes(answer.id) &&
        selectedOptions.selected_answer_ids?.includes(answer.id)
    ) {
        return <Badge colorScheme="red"> Incorrect! </Badge>;
    }

    return <></>;
};
const availableQuestionsWithCorrectAnswers = (
    questionResponse: QuestionResponse
) => {
    // for qns that aren't graded yet
    if (questionResponse.your_score === -1) {
        return false;
    }
    if (questionResponse.total_score == questionResponse.your_score) {
        return true; // selected_ans_id would be the correct answer
    }
    return false;
};

type CombinedQuestion = {
    question_id: number;
    total_score: number;
    highest_score: number;
    best_attempt: QuestionResponse;
    attempts: QuestionResponse[];
    best_attempt_number: number;
} & QuizSubmissionQuestion;

const CombinedQuestionList = ({
    quiz,
    setQuiz,
}: {
    quiz: Quiz & { id: string };
    setQuiz: (quiz: Quiz & { id: string }) => void;
}) => {
    const qns = quiz.questions;

    // for each question,
    // we need to go through all attempts and find the highest scoring one.
    // this case applies for both show_correct_answers and not show_correct_answers
    // if found highest,
    const combinedQuestions: CombinedQuestion[] = qns.map((qn) => {
        const qnId = qn.id;

        let bestResult: QuestionResponse = {};
        let bestAttemptNumber = 0;
        const attempts: QuestionResponse[] = [];
        // use selectedOptions to get the answers in the attempt which has the corresponding quesiton id

        quiz.selectedOptions.forEach((selectedOptions, submissionIndex) => {
            // each selectedOptions is each attempt
            // note the toString: Object.keys returns string[] even though id is number
            if (Object.keys(selectedOptions).includes(qnId.toString())) {
                // this attempt included the qn we are looping through
                const qnAttemptResult = selectedOptions[qnId];
                const attemptScore = qnAttemptResult.your_score ?? -1;

                // update bestResult if this attempt is better
                if (
                    Object.keys(bestResult).length === 0 ||
                    attemptScore > (bestResult.your_score ?? -1)
                ) {
                    bestResult = qnAttemptResult;
                    bestAttemptNumber = submissionIndex + 1;
                }

                // attempt numbers start from 1 while array index is 0
                attempts[quiz.submissions[submissionIndex].attempt - 1] =
                    qnAttemptResult;
            }
        });

        return {
            attempts,
            best_attempt: bestResult,
            best_attempt_number: bestAttemptNumber,
            highest_score: bestResult.your_score ?? -1,
            total_score: bestResult.total_score ?? -1,
            question_id: qnId,
            ...qn,
        };
    });

    const questionBgColor = useColorModeValue("white", "gray.800");

    return (
        <Stack>
            <Heading fontSize="xl">
                {" "}
                Showing best results for each question{" "}
            </Heading>
            <Stack spacing="10">
                {combinedQuestions.map((question, i) => (
                    <Box
                        key={i}
                        borderWidth="1px"
                        borderRadius="md"
                        padding="4"
                        bgColor={questionBgColor}
                    >
                        <Heading
                            fontSize="lg"
                            alignItems={"center"}
                            justifyContent="space-between"
                            display="flex"
                        >
                            {" "}
                            <div>
                                Question {i + 1}{" "}
                                <QuestionResultTag
                                    quiz={quiz}
                                    questionResponse={question.best_attempt}
                                />
                            </div>
                            <FlaggingButton
                                question={question}
                                setQuiz={setQuiz}
                                quiz={quiz}
                            />
                        </Heading>
                        {/* https://stackoverflow.com/questions/23616226/insert-html-with-react-variable-statements-jsx */}
                        <div
                            className="question-text"
                            dangerouslySetInnerHTML={{
                                __html: question.question_text,
                            }}
                        />

                        <Divider />
                        <Tabs>
                            <TabList>
                                <Tab>
                                    {" "}
                                    Best attempt (#
                                    {question.best_attempt_number} -{" "}
                                    {question.best_attempt.your_score} /{" "}
                                    {question.best_attempt.total_score})
                                </Tab>

                                {question.attempts
                                    .map((attempt, i) => ({
                                        v: (
                                            <Tab key={i}>
                                                {" "}
                                                #{i + 1} ({attempt.your_score} /{" "}
                                                {attempt.total_score}){" "}
                                            </Tab>
                                        ),
                                        i,
                                    }))
                                    .filter(
                                        (d) =>
                                            d.i !==
                                            question.best_attempt_number - 1
                                    )
                                    .map((d) => d.v)}
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <AnswerList
                                        questionType={question.question_type}
                                        answers={question.answers}
                                        selectedOptions={question.best_attempt}
                                        show_correct_answers={
                                            quiz.quizInfo.show_correct_answers
                                        }
                                    />
                                </TabPanel>
                                {question.attempts
                                    .map((attempt, i) => ({
                                        v: (
                                            <TabPanel key={i}>
                                                <AnswerList
                                                    questionType={
                                                        question.question_type
                                                    }
                                                    answers={question.answers}
                                                    selectedOptions={attempt}
                                                    show_correct_answers={
                                                        quiz.quizInfo
                                                            .show_correct_answers
                                                    }
                                                />
                                            </TabPanel>
                                        ),
                                        i,
                                    }))
                                    .filter(
                                        (d) =>
                                            d.i !==
                                            question.best_attempt_number - 1
                                    )
                                    .map((d) => d.v)}
                            </TabPanels>
                        </Tabs>
                        <QuestionExtras
                            question={question}
                            quiz={quiz}
                            setQuiz={setQuiz}
                        />
                    </Box>
                ))}{" "}
            </Stack>
        </Stack>
    );

    //

    // <Stack spacing="10">

    // </Stack>
};
