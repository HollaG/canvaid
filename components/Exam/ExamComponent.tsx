import { useAuthContainer, useQuizContainer } from "@/app/providers";
import { uploadExamTemplate } from "@/firebase/database/repositories/uploads";
import {
    ACADEMIC_SEMESTER,
    ACADEMIC_YEAR,
    PAGE_CONTAINER_SIZE,
} from "@/lib/constants";
import { getExaminableQuestions } from "@/lib/functions";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import { Quiz, QuizAnswers, QuizSubmissionQuestion } from "@/types/canvas";
import {
    Checkbox,
    Stack,
    Box,
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
    useBreakpointValue,
    useSteps,
    Collapse,
    Flex,
    Heading,
    useToast,
    Text,
    Button,
    useColorModeValue,
    useMediaQuery,
} from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
    Dispatch,
    FormEvent,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react";
import ExamSettings, { GeneralExamSettings1 } from "./ExamSettings";
import ExamDarkImage from "@/public/assets/exam-dark.svg";
import ExamImage from "@/public/assets/exam.svg";

const ExamComponent = ({ onClose }: { onClose: () => void }) => {
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
        index: 0,
        count: steps.length,
    });

    // ----------------------- generate data ----------------------------------

    const { quizzes, setQuizzes } = useQuizContainer();
    const { user } = useAuthContainer();

    const router = useRouter();
    const toast = useToast();

    const examinableQuizzes = quizzes.filter(
        (quiz) =>
            getExaminableQuestions(quiz).length > 0 &&
            !quiz.quizSettings.isCustom
    );

    const sanitizedExaminableQuizzes = useMemo(() => {
        // change every questionId to include the quizId

        // questionId to change: `id` and also in quizAnswers

        if (!examinableQuizzes) return [];
        return examinableQuizzes.map((quiz, index) => {
            const newQuizAnswers: QuizAnswers = {};

            for (const oldQnId in quiz.quizAnswers) {
                const newQnId = parseInt(oldQnId) * ((index + 1) * 2);
                newQuizAnswers[newQnId] = quiz.quizAnswers[oldQnId];
            }

            return {
                ...quiz,
                questions: quiz.questions.map((qn) => ({
                    ...qn,
                    id: qn.id * ((index + 1) * 2),
                })),
                quizAnswers: newQuizAnswers,
            };
        });
    }, [examinableQuizzes]);

    if (!sanitizedExaminableQuizzes.length) {
        // none
    }

    const groupedByCourseCode = sanitizedExaminableQuizzes.reduce(
        (acc, quiz) => {
            const courseCode = quiz.course.split(" ")[0];
            if (!acc[courseCode]) {
                acc[courseCode] = [];
            }
            acc[courseCode].push(quiz);
            return acc;
        },
        {} as Record<string, (Quiz & { id: string })[]>
    );

    // controlled components
    // array of ids
    const [categoryName, setCategoryName] = useState<string>("");
    const [newQuizName, setNewQuizName] = useState<string>("");

    const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
    const [numQns, setNumQns] = useState<number | undefined>();
    const totalAvailableQns = sanitizedExaminableQuizzes
        .filter((eq) => selectedQuizzes.includes(eq.id))
        .reduce((acc, quiz) => acc + getExaminableQuestions(quiz).length, 0);

    // refresh the number of questions whenever the selected quizzes change
    useEffect(() => {
        setNumQns(totalAvailableQns);
    }, [selectedQuizzes, totalAvailableQns]);

    const [examLength, setExamLength] = useState<number | undefined>();

    const [isRandom, setIsRandom] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>("");

    const [isCreating, setIsCreating] = useState<boolean>(false);
    const createExam = () => {
        if (!user) return;

        if (!selectedQuizzes.length)
            return setErrorMessage("Please select at least one quiz!");
        if (!newQuizName) return setErrorMessage("Please enter a name!");

        setIsCreating(true);
        // construct the new `quiz` object
        const newQuizId = Math.random() * 100000;

        const chosenQuizzes = selectedQuizzes.map((quizId) =>
            sanitizedExaminableQuizzes.find((quiz) => quiz.id === quizId)
        );

        const questions = chosenQuizzes.reduce((acc, quiz) => {
            if (!quiz) return acc;
            return [...acc, ...getExaminableQuestions(quiz)];
        }, [] as QuizSubmissionQuestion[]);

        let compiledQuizAnswers: QuizAnswers = {};
        chosenQuizzes.forEach((quiz) => {
            compiledQuizAnswers = {
                ...compiledQuizAnswers,
                ...quiz?.quizAnswers,
            };
        });

        const chosenQuestions = questions
            .sort(() => (!isRandom ? 0 : Math.random() - 0.5))
            .slice(0, numQns !== undefined ? numQns : questions.length);

        const chosenQuestionIDs = chosenQuestions.map(
            (question) => question.id
        );

        const chosenQuizAnswers: QuizAnswers = {};
        chosenQuestionIDs.forEach((id) => {
            if (compiledQuizAnswers[id])
                chosenQuizAnswers[id] = compiledQuizAnswers[id];
        });

        const quiz: Quiz = {
            submissions: [],
            selectedOptions: [],

            questions,

            quizName: newQuizName,
            course: categoryName === "" ? "Custom" : categoryName,
            userUid: user.uid,
            lastUpdated: new Date(),

            quizInfo: {
                id: newQuizId,
                title: newQuizName,
                html_url: "",
                mobile_url: "",
                preview_url: "",
                description: "",
                quiz_type: "practice_quiz",
                assignment_group_id: 0,
                time_limit: 0,
                shuffle_answers: false,
                hide_results: null,
                show_correct_answers: false,
                show_correct_answers_last_attempt: false,
                show_correct_answers_at: "",
                hide_correct_answers_at: "",
                one_time_results: false,
                scoring_policy: "keep_highest",
                allowed_attempts: 0,
                one_question_at_a_time: false,
                question_count: 0,
                points_possible: 0,
                cant_go_back: false,
                access_code: "",
                ip_filter: "",
                due_at: "",
                lock_at: "",
                unlock_at: "",
                published: false,
                unpublishable: false,
                locked_for_user: false,
                lock_info: "",
                lock_explanation: "",
                speedgrader_url: "",
                quiz_extensions_url: "",
                permissions: {
                    read: true,
                    submit: true,
                    create: true,
                    manage: true,
                    read_statistics: true,
                    review_grades: true,
                    update: true,
                },
                all_dates: "",
                version_number: 0,
                question_types: [""],
                anonymous_submissions: false,
            },

            quizAnswers: chosenQuizAnswers,
            quizSettings: {
                academicYear: ACADEMIC_YEAR,
                semester: ACADEMIC_SEMESTER,
                isPinned: false,
                isCustom: true,
            },

            sources: selectedQuizzes,
        };

        uploadExamTemplate(quiz)
            .then(({ id }) => {
                onClose();
                router.push(
                    `/uploads/${id}/exam?length=${examLength}&num=${numQns}&random=${isRandom}`
                );
                toast({
                    title: "Exam created!",
                    description: "You may now begin your exam.",
                    ...SUCCESS_TOAST_OPTIONS,
                });
            })
            .catch((err) => {
                console.error(err);
                toast({
                    title: "Error creating exam",
                    description: err.toString(),
                    ...ERROR_TOAST_OPTIONS,
                });
            })
            .finally(() => {
                setIsCreating(false);
            });
    };

    const [showIllustration] = useMediaQuery("(min-width: 1000px)");
    const isDarkMode = useColorModeValue(false, true);

    return (
        <Container maxW={PAGE_CONTAINER_SIZE} data-testid="exam-component">
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
                <Collapse
                    in={activeStep === 0}
                    unmountOnExit
                    data-testid="step-1"
                >
                    <Flex mt={8} direction="column">
                        <Flex alignItems={"center"} mb={{ base: 14, md: 28 }}>
                            <Heading fontWeight={"semibold"} fontSize="5xl">
                                Let&apos;s create an exam
                            </Heading>
                        </Flex>

                        <GeneralExamSettings1
                            groupedByCourseCode={groupedByCourseCode}
                            setSelectedQuizzes={setSelectedQuizzes}
                            selectedQuizzes={selectedQuizzes}
                            categoryName={categoryName}
                            setCategoryName={setCategoryName}
                            quizName={newQuizName}
                            setQuizName={setNewQuizName}
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
                                // onClick={acceptUpload}
                                data-testid="next-btn"
                                onClick={() => setActiveStep(1)}
                                isDisabled={
                                    !selectedQuizzes.length ||
                                    newQuizName === ""
                                }
                            >
                                Next step
                            </Button>
                        </Flex>
                    </Flex>
                </Collapse>
                <Collapse
                    in={activeStep === 1}
                    unmountOnExit
                    data-testid="step-2"
                >
                    <Flex mt={8} direction="column" mb={{ base: 14, md: 28 }}>
                        <Flex alignItems={"center"}>
                            <Heading fontWeight={"semibold"} fontSize="5xl">
                                Customize your quiz
                            </Heading>
                        </Flex>
                    </Flex>
                    <ExamSettings
                        examLength={examLength}
                        setExamLength={setExamLength}
                        isRandom={isRandom}
                        setIsRandom={setIsRandom}
                        maxQns={totalAvailableQns}
                        numQns={numQns}
                        setNumQns={setNumQns}
                    />
                    <Flex mt={16}>
                        <Button
                            colorScheme={"gray"}
                            mr={4}
                            mb={3}
                            onClick={() => {
                                setActiveStep(0);
                                // clear the custom selection

                                setIsRandom(false);
                                setExamLength(undefined);
                            }}
                        >
                            Go back
                        </Button>
                        <Button
                            // onClick={acceptUpload}
                            data-testid="next-btn"
                            onClick={createExam}
                            isDisabled={
                                !selectedQuizzes.length || newQuizName === ""
                            }
                            colorScheme="orange"
                            isLoading={isCreating}
                        >
                            Start Exam
                        </Button>
                    </Flex>
                </Collapse>
            </Container>
        </Container>
    );
};

export default ExamComponent;
