"use client";
import {
    Quiz,
    QuestionResponse,
    Answer,
    Exam,
    ExamDetails,
    CanvasQuizSubmission,
    QuizSubmissionQuestion,
    QuizAnswers,
} from "@/types/canvas";
import {
    Select,
    Button,
    Flex,
    Stack,
    useColorModeValue,
    Heading,
    Accordion,
    AccordionIcon,
    AccordionItem,
    AccordionButton,
    Checkbox,
    AccordionPanel,
    Box,
    FormControl,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    FormHelperText,
    Center,
    useToast,
} from "@chakra-ui/react";
import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContainer, useQuizContainer } from "../providers";
import { getExaminableQuestions, removeLetters } from "@/lib/functions";
import {
    ACADEMIC_SEMESTER,
    ACADEMIC_YEAR,
    NAVBAR_HEIGHT,
    SIDEBAR_WIDTH,
} from "@/lib/constants";
import { uuidv4 } from "@firebase/util";
import { uploadExamTemplate } from "@/firebase/database/repositories/uploads";
export default function Page() {
    const { quizzes, setQuizzes } = useQuizContainer();
    const { user } = useAuthContainer();

    const router = useRouter();
    const toast = useToast();

    const examinableQuizzes = quizzes.filter(
        (quiz) => getExaminableQuestions(quiz).length > 0
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

    // controlled components for checkbox
    // array of ids
    const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
    const [numQns, setNumQns] = useState<number | undefined>();
    const totalAvailableQns = sanitizedExaminableQuizzes
        .filter((eq) => selectedQuizzes.includes(eq.id))
        .reduce((acc, quiz) => acc + getExaminableQuestions(quiz).length, 0);

    const [examLength, setExamLength] = useState<number | undefined>();
    const [newQuizName, setNewQuizName] = useState<string>("");

    const [enableRandom, setEnableRandom] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>("");
    const createExam = (e: FormEvent<HTMLFormElement>) => {
        if (!user) return;
        e.preventDefault();

        if (!selectedQuizzes.length)
            return setErrorMessage("Please select at least one quiz!");

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
            .sort(() => (!enableRandom ? 0 : Math.random() - 0.5))
            .slice(0, numQns !== undefined ? numQns : questions.length);

        const chosenQuestionIDs = chosenQuestions.map(
            (question) => question.id
        );

        const chosenQuizAnswers: QuizAnswers = {};
        chosenQuestionIDs.forEach((id) => {
            if (compiledQuizAnswers[id])
                chosenQuizAnswers[id] = compiledQuizAnswers[id];
        });
        console.log({ chosenQuizAnswers });
        const quiz: Quiz = {
            submissions: [],
            selectedOptions: [],

            questions,

            quizName: newQuizName,
            course: "Custom",
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
            },

            sources: selectedQuizzes,
        };

        uploadExamTemplate(quiz)
            .then(({ id }) => {
                router.push(`/uploads/${id}/exam?length=${examLength}`);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    return (
        <form onSubmit={createExam}>
            <Flex
                minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
                px={{ base: 0, md: 6 }}
            >
                <Stack
                    flexGrow={1}
                    mt={{ base: 0, md: 6 }}
                    ml={{ base: 0, md: SIDEBAR_WIDTH }}
                    bgColor={useColorModeValue("gray.50", "gray.900")}
                    backgroundImage={useColorModeValue(
                        "url(/assets/background.svg)",
                        "url(/assets/background-dark.svg)"
                    )}
                    backgroundSize={"200%"}
                    borderRadius={{ base: 0, md: "xl" }}
                    spacing={6}
                    p={4}
                >
                    {!sanitizedExaminableQuizzes.length ? (
                        <Heading>
                            {" "}
                            No quizzes that you can be tested on{" "}
                        </Heading>
                    ) : (
                        <>
                            <Heading> Choose a quiz </Heading>
                            <CheckboxTree
                                groupedByCourseCode={groupedByCourseCode}
                                setSelectedQuizzes={setSelectedQuizzes}
                                selectedQuizzes={selectedQuizzes}
                            />
                            <FormControl
                                id="quizName"
                                isRequired
                                variant="floating_alt"
                            >
                                <Input
                                    value={newQuizName}
                                    onChange={(e) => {
                                        setNewQuizName(e.target.value);
                                    }}
                                    type="text"
                                    // variant="flushed"
                                    placeholder=" "
                                />
                                <FormLabel>Quiz Name</FormLabel>
                                <FormHelperText>
                                    This helps to identify your custom quiz in
                                    future.
                                </FormHelperText>
                            </FormControl>
                            <FormControl
                                id="numQns"
                                variant="floating_alt_perm"
                            >
                                <NumberInput
                                    value={numQns}
                                    onChange={(_, num) =>
                                        setNumQns(isNaN(num) ? undefined : num)
                                    }
                                    min={1}
                                    max={totalAvailableQns}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <FormLabel>
                                    Number of questions (optional)
                                </FormLabel>
                                <FormHelperText>
                                    Optional. A random subset of questions from
                                    all the quizzes will be chosen.
                                </FormHelperText>
                            </FormControl>
                            <FormControl
                                id="examLength"
                                variant="floating_alt_perm"
                            >
                                <NumberInput
                                    value={examLength}
                                    onChange={(_, num) =>
                                        setExamLength(
                                            isNaN(num) ? undefined : num
                                        )
                                    }
                                    min={0}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <FormLabel>Exam duration (minutes)</FormLabel>
                                <FormHelperText>
                                    Optional. A timer will be shown for you.
                                </FormHelperText>
                            </FormControl>
                            <Center>
                                <Button type="submit"> Begin Quiz </Button>
                            </Center>
                        </>
                    )}
                </Stack>
            </Flex>
        </form>
    );
}

const CheckboxTree = ({
    groupedByCourseCode,
    selectedQuizzes,
    setSelectedQuizzes,
}: {
    groupedByCourseCode: {
        [courseCode: string]: (Quiz & { id: string })[];
    };
    setSelectedQuizzes: Dispatch<SetStateAction<string[]>>;
    selectedQuizzes: string[];
}) => {
    return (
        <>
            {Object.keys(groupedByCourseCode).map((courseCode, i) => {
                const quizzesForCourse = groupedByCourseCode[courseCode];
                const allChecked = quizzesForCourse.every((quiz) =>
                    selectedQuizzes.includes(quiz.id)
                );
                const someChecked =
                    quizzesForCourse.some((quiz) =>
                        selectedQuizzes.includes(quiz.id)
                    ) && !allChecked;
                return (
                    <Box key={i}>
                        <Checkbox
                            onChange={(e) => {
                                setSelectedQuizzes((prev) => {
                                    // if this checkbox got checked, add all the quizzes for this course
                                    if (e.target.checked) {
                                        return [
                                            ...new Set([
                                                ...prev,
                                                ...quizzesForCourse.map(
                                                    (quiz) => quiz.id
                                                ),
                                            ]),
                                        ];
                                    } else {
                                        // if this checkbox got unchecked, remove all the quizzes for this course
                                        return prev.filter(
                                            (id) =>
                                                !quizzesForCourse
                                                    .map((quiz) => quiz.id)
                                                    .includes(id)
                                        );
                                    }
                                });
                            }}
                            isIndeterminate={someChecked}
                            isChecked={allChecked}
                            fontWeight="semibold"
                        >
                            {quizzesForCourse[0].course}
                        </Checkbox>
                        <Stack pl={6} mt={1} spacing={1}>
                            {quizzesForCourse.map((quiz, j) => (
                                <Checkbox
                                    // isChecked={checkedItems[0]}
                                    // onChange={(e) =>
                                    //     setCheckedItems([
                                    //         e.target.checked,
                                    //         checkedItems[1],
                                    //     ])
                                    // }
                                    key={j}
                                    isChecked={selectedQuizzes.includes(
                                        quiz.id
                                    )}
                                    onChange={(e) => {
                                        setSelectedQuizzes((prev) => {
                                            if (e.target.checked) {
                                                return [...prev, quiz.id];
                                            } else {
                                                return prev.filter(
                                                    (id) => id !== quiz.id
                                                );
                                            }
                                        });
                                    }}
                                >
                                    {quiz.quizName}
                                </Checkbox>
                            ))}
                        </Stack>
                    </Box>
                );
            })}
        </>
    );
};

const getQuestionWithCorrectAnswer = () => {};
const AnswerResultTag = ({
    selectedOptions,
    answer,
}: {
    selectedOptions: QuestionResponse;
    answer?: Answer;
}) => {
    // for qns that aren't graded yet
    if (selectedOptions.your_score === -1) {
        return false;
    }
    // for qns that aren't multiple choice so no correct answeer as its open text
    if (!answer) {
        return false;
    }
    // if this option is correct but not selected
    if (
        selectedOptions.correct_answer_ids?.includes(answer.id) &&
        !selectedOptions.selected_answer_ids?.includes(answer.id)
    ) {
        return true;
    }

    // if this option is correct
    if (selectedOptions.correct_answer_ids?.includes(answer.id)) {
        return true;
    }

    return false;
}; // put examDetails in here
const ExamMenu = ({ examQuizzes }: { examQuizzes: any }) => {
    return <div>Exam Menu</div>;
};
const ExamMode = () => {
    return <div>Exam Mode</div>;
};
