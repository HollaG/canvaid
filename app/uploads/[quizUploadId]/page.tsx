"use client";
import {
    getQuizUpload,
    addQuizQuestionAnnotation,
    updateQuizQuestionFlag,
    deleteAttempt,
    deleteQuiz,
    importToSelf,
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
    QuizSubmissionQuestion,
} from "@/types/canvas";
import {
    Input,
    IconButton,
    Badge,
    Box,
    Button,
    Checkbox,
    CheckboxGroup,
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
    useColorModeValue,
    Tooltip,
    useDisclosure,
    Alert,
    AlertIcon,
    AlertTitle,
    useToast,
    useSteps,
    useBreakpointValue,
    Container,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    useMediaQuery,
    useBoolean,
    AlertDescription,
} from "@chakra-ui/react";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { FaRegFlag, FaFlag } from "react-icons/fa";
import { TbEye, TbEyeFilled } from "react-icons/tb";
import { DeleteAnnotationButton } from "@/components/DeleteButton";
import CourseInfo from "@/components/Display/CourseInfo";
import {
    useAuthContainer,
    useQuizContainer,
    useSidebarContainer,
} from "@/app/providers";
import CustomAlertDialog from "@/components/Alert/CustomAlertDialog";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import {
    convertCustomAttemptNumber,
    getExaminableQuestions,
} from "@/lib/functions";

import { TbTrashX } from "react-icons/tb";
import ExamSettings from "@/components/Exam/ExamSettings";
import { ExamAnswerList } from "@/components/Exam/ExamAnswerList";
import DrawerContainer from "@/components/Drawer/DrawerContainer";
import Image from "next/image";

import ExamImage from "@/public/assets/exam.svg";
import ExamDarkImage from "@/public/assets/exam-dark.svg";
import Navbar from "@/components/Navbar/Navbar";

/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const params = useParams();
    const dataId = params.quizUploadId;
    const { quizzes, setQuiz } = useQuizContainer();
    const authCtx = useAuthContainer();
    const { isOpenSidebar, setIsOpenSidebar } = useSidebarContainer();
    const user = authCtx.user;
    const router = useRouter();
    const quiz = quizzes.filter((quiz) => quiz.id === dataId)[0];
    const toast = useToast();
    const [pageQuiz, setPageQuiz] = useState(
        quizzes.filter((quiz) => quiz.id === dataId)[0]
    );

    const searchParams = useSearchParams();
    const submissionIndexToShow = searchParams.get("submission");

    // fetch quiz incase this is not this user's quiz
    const isUserQuiz = user && quiz?.userUid === user.uid;
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
        } else {
        }
    }, [dataId, quiz, setQuiz, router]);

    // import quiz
    const [isImporting, setIsImporting] = useState(false);
    const onImport = () => {
        // import the quiz and redirect to that specific quiz page
        if (!user) return;
        setIsImporting(true);
        importToSelf(quiz, user.uid)
            .then((newQuiz) => {
                toast({
                    ...SUCCESS_TOAST_OPTIONS,
                    title: "Quiz imported!",
                });
                router.push(`/uploads/${newQuiz.id}`);
            })
            .catch((e) => {
                toast({
                    ...ERROR_TOAST_OPTIONS,
                    title: "Error importing quiz",
                    description: e.message,
                });
            })
            .finally(() => {
                setIsImporting(false);
            });
    };

    const [submissionIndex, setSubmissionIndex] = useState(
        submissionIndexToShow ? parseInt(submissionIndexToShow) : 0
    );
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

    const [examinableQuestionNumber, setExaminableQuestionNumber] = useState<
        number | undefined
    >();
    const [numQns, setNumQns] = useState<number | undefined>();
    const [examLength, setExamLength] = useState<number | undefined>();
    const [isRandom, setIsRandom] = useState(false);

    useEffect(() => {
        setExaminableQuestionNumber(getExaminableQuestions(quiz).length);
        setNumQns(getExaminableQuestions(quiz).length);
    }, [quiz]);

    const noFlaggedQuestions =
        getQuestionsForAttempt(submissionIndex).filter((qn) => qn.isFlagged)
            .length === 0;

    // for exam mode
    const steps = [
        {
            title: "Select",
            description: "Select the quiz questions that you want",
        },
        {
            title: "Configure",
            description: "Set up your exam how you want it",
        },
    ];
    const stepperOrienation = useBreakpointValue({
        base: "vertical",
        md: "horizontal",
    });

    const { activeStep, setActiveStep } = useSteps({
        index: 1,
        count: steps.length,
    });

    const [showIllustration] = useMediaQuery("(min-width: 1000px)");
    const isDarkMode = useColorModeValue(false, true);

    // For showing / hiding flagged questions
    const [showFlaggedOnly, setShowFlaggedOnly] = useBoolean(false);
    console.log("flag" + showFlaggedOnly);
    useEffect(() => {
        if (noFlaggedQuestions && showFlaggedOnly == true) {
            setShowFlaggedOnly.toggle();
        }
    }, [noFlaggedQuestions, setShowFlaggedOnly]);
    return (
        // <Container maxW={PAGE_CONTAINER_SIZE} mt={NAVBAR_HEIGHT} pt={3}>
        <Flex
            minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
            // mt={NAVBAR_HEIGHT}
            px={{ base: 0, md: 6 }}
        >
            {!user && <Navbar />}
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
                        data-testid="confirm-delete-quiz"
                    >
                        Delete
                    </Button>
                }
            />
            <CustomAlertDialog
                {...attemptDeleteDisclosure}
                bodyText={`Are you sure you want to delete Attempt #${convertCustomAttemptNumber(
                    attemptNumberToDelete
                )}?  
                
                This action is not reversible.`}
                headerText={`Delete Attempt #${convertCustomAttemptNumber(
                    attemptNumberToDelete
                )}`}
                ConfirmButton={
                    <Button
                        onClick={confirmDeleteAttempt}
                        isLoading={isDeletingAttempt}
                        colorScheme="red"
                        data-testid="confirm-delete-attempt"
                    >
                        Delete
                    </Button>
                }
            />
            <DrawerContainer onClose={onClose} isOpen={isOpen}>
                <Container maxW={PAGE_CONTAINER_SIZE}>
                    {showIllustration && (
                        <Box position="fixed" bottom={-2} right={-50} w="600px">
                            <Image
                                src={isDarkMode ? ExamDarkImage : ExamImage}
                                alt="Image representing exam mode"
                            />
                        </Box>
                    )}
                    <Container maxW="container.md" ml={0}>
                        <Box>
                            <Stepper
                                index={activeStep}
                                orientation={stepperOrienation as any}
                            >
                                {steps.map((step, index) => (
                                    <Step key={index}>
                                        <StepIndicator>
                                            <StepStatus
                                                complete={<StepIcon />}
                                                incomplete={<StepNumber />}
                                                active={<StepNumber />}
                                            />
                                        </StepIndicator>

                                        <Box flexShrink="0">
                                            <StepTitle>{step.title}</StepTitle>
                                            <StepDescription>
                                                {step.description}
                                            </StepDescription>
                                        </Box>

                                        <StepSeparator />
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                        <Flex mt={8} direction="column" mb={16}>
                            <Flex alignItems={"center"}>
                                <Heading fontWeight={"semibold"} fontSize="5xl">
                                    Customize your quiz
                                </Heading>
                            </Flex>
                        </Flex>
                        <ExamSettings
                            examLength={examLength}
                            setExamLength={setExamLength}
                            maxQns={examinableQuestionNumber}
                            isRandom={isRandom}
                            setIsRandom={setIsRandom}
                            numQns={numQns}
                            setNumQns={setNumQns}
                        />
                        <Flex mt={16}>
                            <Button
                                colorScheme={"gray"}
                                mr={4}
                                mb={3}
                                onClick={onClose}
                            >
                                Go back
                            </Button>
                            <Button
                                onClick={() => {
                                    onClose();
                                    // setIsExamMode(true);
                                    router.push(
                                        `/uploads/${quiz.id}/exam?num=${numQns}&length=${examLength}&random=${isRandom}`
                                    );
                                }}
                                colorScheme="orange"
                                data-testid="start-exam-btn"
                            >
                                Start Exam
                            </Button>
                        </Flex>
                    </Container>
                </Container>
            </DrawerContainer>

            {quiz ? (
                <Stack
                    spacing={6}
                    flexGrow={1}
                    ml={
                        user
                            ? isOpenSidebar
                                ? { base: 0, md: SIDEBAR_WIDTH }
                                : { base: 0, md: "60px" }
                            : 0
                    }
                    p={4}
                    bgColor={bgColor}
                    borderRadius={{ base: 0, md: "xl" }}
                    mt={{ base: 0, md: 6 }}
                    pt={!user ? NAVBAR_HEIGHT : 0}
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
                    {!isUserQuiz && user && (
                        <Alert
                            status="warning"
                            onClick={onImport}
                            cursor="pointer"
                        >
                            <AlertIcon />
                            <AlertTitle>Viewing external quiz!</AlertTitle>
                            <AlertDescription>
                                {" "}
                                {isImporting
                                    ? "Importing..."
                                    : "Click here to import to your collection."}{" "}
                            </AlertDescription>
                        </Alert>
                    )}
                    {deleteErrorMessage && (
                        <Alert status="error">
                            <AlertIcon />
                            <AlertTitle>{deleteErrorMessage}</AlertTitle>
                        </Alert>
                    )}
                    <CourseInfo
                        courseCode={quiz.course.split(" ")[0]}
                        courseName={quiz.course.split(" ").slice(1).join(" ")}
                        Button={
                            user && user.uid === quiz.userUid ? (
                                <Tooltip label="Delete this quiz">
                                    <Button
                                        colorScheme={"red"}
                                        onClick={alertDeleteDisclosure.onOpen}
                                        isLoading={isDeleting}
                                        size="sm"
                                        data-testid="delete-quiz"
                                    >
                                        <TbTrashX />
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
                            ) : (
                                <></>
                            )
                        }
                    />
                    <Heading>{quiz.quizName}</Heading>

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
                                Total questions seen: {quiz.questions.length}
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
                                {user ? (
                                    <Button
                                        onClick={onOpen}
                                        colorScheme="orange"
                                        variant="outline"
                                        data-testid="exam-mode-btn"
                                    >
                                        Enter Exam Mode
                                    </Button>
                                ) : (
                                    <></>
                                )}
                                {quiz.submissions.length !== 0 ? (
                                    <>
                                        <Divider />
                                        <Button
                                            variant={
                                                submissionIndex === -1 ||
                                                submissionIndex >=
                                                    quiz.submissions.length
                                                    ? "solid"
                                                    : "outline"
                                            }
                                            colorScheme="teal"
                                            onClick={() =>
                                                setSubmissionIndex(-1)
                                            }
                                            data-testid="combined-button"
                                        >
                                            Combined
                                        </Button>
                                        <Divider />
                                    </>
                                ) : (
                                    <></>
                                )}
                                {quiz.submissions.map((submission, i) => (
                                    <Button
                                        variant={
                                            submissionIndex === i
                                                ? "solid"
                                                : "ghost"
                                        }
                                        colorScheme="teal"
                                        key={i}
                                        textAlign="left"
                                        onClick={() => setSubmissionIndex(i)}
                                        fontSize="sm"
                                    >
                                        Attempt #
                                        {convertCustomAttemptNumber(
                                            submission.attempt
                                        )}{" "}
                                        (
                                        {submission.score !== undefined
                                            ? `${
                                                  Math.round(
                                                      submission.score * 100
                                                  ) / 100
                                              }/${
                                                  submission.quiz_points_possible
                                              }`
                                            : "Ungraded"}
                                        )
                                    </Button>
                                ))}
                            </Stack>
                        </GridItem>
                        {quiz.submissions.length !== 0 ? (
                            <GridItem p={5}>
                                {submissionIndex === -1 ||
                                submissionIndex >= quiz.submissions.length ? (
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
                                                {convertCustomAttemptNumber(
                                                    quiz.submissions[
                                                        submissionIndex
                                                    ].attempt
                                                )}
                                            </Heading>
                                            {user &&
                                            user.uid === quiz.userUid ? (
                                                <Flex alignItems={"center"}>
                                                    {!noFlaggedQuestions && (
                                                        <Tooltip
                                                            label={`${
                                                                showFlaggedOnly
                                                                    ? "Show all questions"
                                                                    : "Show only flagged questions"
                                                            }`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                colorScheme={
                                                                    "teal"
                                                                }
                                                                variant={
                                                                    showFlaggedOnly
                                                                        ? "solid"
                                                                        : "outline"
                                                                }
                                                                onClick={
                                                                    setShowFlaggedOnly.toggle
                                                                }
                                                                data-testid={`toggle-flagged`}
                                                                ml={2}
                                                                w="40px"
                                                            >
                                                                {showFlaggedOnly ? (
                                                                    <TbEyeFilled />
                                                                ) : (
                                                                    <TbEye />
                                                                )}
                                                            </Button>
                                                        </Tooltip>
                                                    )}

                                                    <Tooltip label="Delete this attempt">
                                                        <Button
                                                            size="sm"
                                                            colorScheme={"red"}
                                                            onClick={() => {
                                                                attemptDeleteDisclosure.onOpen();
                                                                setAttemptNumberToDelete(
                                                                    quiz
                                                                        .submissions[
                                                                        submissionIndex
                                                                    ].attempt
                                                                );
                                                            }}
                                                            data-testid={`delete-attempt-${quiz.submissions[submissionIndex].attempt}`}
                                                        >
                                                            <TbTrashX />
                                                        </Button>
                                                    </Tooltip>
                                                </Flex>
                                            ) : (
                                                <></>
                                            )}
                                        </Flex>
                                        <Stack spacing="10">
                                            {getQuestionsForAttempt(
                                                submissionIndex
                                            )
                                                .filter((qn) =>
                                                    showFlaggedOnly
                                                        ? qn.isFlagged
                                                        : true
                                                )
                                                .map((question, i) => (
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
                                                                            submissionIndex
                                                                        ][
                                                                            question
                                                                                .id
                                                                        ]
                                                                    }
                                                                />
                                                            </div>
                                                            {user &&
                                                            user.uid ===
                                                                quiz.userUid ? (
                                                                <FlaggingButton
                                                                    question={
                                                                        question
                                                                    }
                                                                    quiz={quiz}
                                                                    setQuiz={
                                                                        setQuiz
                                                                    }
                                                                />
                                                            ) : (
                                                                <></>
                                                            )}
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
                                                                        submissionIndex
                                                                    ] &&
                                                                    quiz
                                                                        .selectedOptions[
                                                                        submissionIndex
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
                        ) : (
                            <GridItem p={5}>
                                <Stack>
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems="center"
                                    >
                                        <Heading fontSize="xl">
                                            Question List
                                        </Heading>
                                        <Flex></Flex>
                                    </Flex>
                                    <Stack spacing="10">
                                        {quiz.questions.map((question, i) => (
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
                                                    justifyContent={
                                                        "space-between"
                                                    }
                                                >
                                                    <div>
                                                        {" "}
                                                        Question {i + 1}{" "}
                                                    </div>
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
                                                    selectedOptions={{}}
                                                    setSelectedOptions={() => {}}
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            </GridItem>
                        )}
                    </Grid>
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

const FlaggingButton = ({
    question,
    quiz,
    setQuiz,
}: {
    question: QuizSubmissionQuestion;
    quiz: Quiz & { id: string };
    setQuiz: (quiz: Quiz & { id: string }) => void;
}) => {
    const toast = useToast();
    const handleFlagQuestion = async (questionId: number) => {
        try {
            const updatedQuizData = await updateQuizQuestionFlag(
                quiz,
                questionId,
                !question.isFlagged
            );
            setQuiz(updatedQuizData);

            toast({
                ...SUCCESS_TOAST_OPTIONS,
                title: `Question ${
                    !question.isFlagged ? "flagged" : "unflagged"
                }`,
            });
        } catch (e: any) {
            console.log(e);
            toast({
                ...ERROR_TOAST_OPTIONS,
                title: `Error ${
                    !question.isFlagged ? "flagging" : "unflagging"
                } question`,
                description: e.toString(),
            });
        }
    };
    return (
        <IconButton
            aria-label={`${question.isFlagged ? "Unflag" : "Flag"} question`}
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
    const { user } = useAuthContainer();
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
            {user && user.uid === quiz.userUid ? (
                <form
                    onSubmit={(event) =>
                        handleSubmitAnnotation(event, question.id)
                    }
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
            ) : question.annotations.length ? (
                <Text fontWeight={"semibold"}> Comments </Text>
            ) : (
                <></>
            )}

            <Stack>
                {question.annotations.length &&
                    question.annotations.map((annotation, i) => {
                        return (
                            <Flex key={i}>
                                <Text flexGrow={1}>
                                    {" "}
                                    {annotation.annotation}
                                </Text>
                                {user && user.uid ? (
                                    <DeleteAnnotationButton
                                        ID={quiz.id}
                                        annotationID={annotation.annotationID}
                                        setQuiz={setQuiz}
                                        question={question}
                                    />
                                ) : (
                                    <></>
                                )}
                            </Flex>
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
                    <Stack divider={<Divider />}>
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
                                    {answer.html ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: answer.html,
                                            }}
                                        />
                                    ) : (
                                        answer.text
                                    )}
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
                    <Stack spacing={4} divider={<Divider />}>
                        {answers.map((answer, i) => (
                            <Flex
                                alignItems={{ base: "unset", sm: "center" }}
                                key={i}
                                flexDirection={{ base: "column", sm: "row" }}
                            >
                                <Box
                                    width="100px"
                                    textAlign={{ base: "unset", sm: "end" }}
                                    mr={3}
                                    flexShrink={0}
                                    // display={{ base: "none", md: "unset" }}
                                >
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
                                    {answer.html ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: answer.html,
                                            }}
                                        />
                                    ) : (
                                        answer.text
                                    )}
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
                        <Box
                            width="100px"
                            textAlign="end"
                            mr={3}
                            flexShrink={0}
                        >
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
                            <Box
                                width="100px"
                                textAlign="end"
                                mr={3}
                                flexShrink={0}
                            >
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
        <Stack data-testid="combined-questions-list">
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
                            {/* <FlaggingButton
                                question={question}
                                setQuiz={setQuiz}
                                quiz={quiz}
                            /> */}
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
};
