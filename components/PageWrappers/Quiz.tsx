"use client";
import {
    getQuizUpload,
    addQuizQuestionAnnotation,
    updateQuizQuestionFlag,
} from "@/firebase/database/repositories/uploads";
import {
    COLLECTION_NAME,
    NAVBAR_HEIGHT,
    PAGE_CONTAINER_SIZE,
    SIDEBAR_WIDTH,
} from "@/lib/constants";
import {
    Answer,
    QuestionResponse,
    QuizResponse,
    CanvasQuizSubmissionQuestion,
    QuizAttempt,
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
    useToast,
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
} from "react";
import { FaRegFlag, FaFlag } from "react-icons/fa";

import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

import Sidebar from "@/components/Sidebar/Sidebar";
import CourseInfo from "@/components/Display/CourseInfo";
import { useAuthContainer } from "@/app/providers";
import useSidebar from "@/hooks/useSidebar";
import { getUploads } from "@/lib/functions";
import { db } from "@/firebase/database";
import { TbTrashX } from "react-icons/tb";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";

/**
 * @deprecated
 * @returns The page for each user's quiz that they uploaded.
 */
export default function QuizContainer({
    loadedQuiz,
}: {
    loadedQuiz: Quiz & { id: string };
}) {
    const params = useParams();
    const dataId = params.quizUploadId;

    const [questionInputs, setQuestionInputs] = useState<string>("");
    const [quiz, setQuiz] = useState<Quiz & { id: string }>(loadedQuiz);
    // const [quizAnnotations, setQuizAnnotations] = useState(
    //     quiz?.questions.map((qn) => ({stateid:qn.id, stateAnnotation: qn.annotations}))
    // );
    const [updatedQuiz, setUpdatedQuiz] = useState<Quiz | undefined>(undefined);

    const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);

    const { user } = useAuthContainer();
    useEffect(() => {
        if (user) {
            getUploads(user.uid).then(
                (data: {
                    data: (Quiz & {
                        id: string;
                    })[];
                }) => {
                    setQuizzes(data.data || []);
                    setQuiz(data.data.filter((quiz) => quiz.id === dataId)[0]);
                }
            );
        }

        // if (user?.canvasApiToken) {
        //   setHasToken(true);
        // } else {
        //   setHasToken(false);
        // }
    }, [user, dataId]);

    // useEffect(() => {
    //     if (dataId)
    //         getQuizUpload(dataId)
    //             .then(setQuiz)
    //             .catch((e) => {
    //                 console.log(e);
    //             });
    // }, [dataId]);

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

    return (
        // <Container maxW={PAGE_CONTAINER_SIZE} mt={NAVBAR_HEIGHT} pt={3}>
        <Flex minH={`calc(100vh - ${NAVBAR_HEIGHT})`} mt={NAVBAR_HEIGHT}>
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
                    <CourseInfo
                        courseCode={quiz.course.split(" ")[0]}
                        courseName={quiz.course.split(" ").slice(1).join(" ")}
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
                        gridTemplateColumns={{ base: "1fr", md: "200px 1fr" }}
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
                                    onClick={() => setSelectedAttemptIndex(-1)}
                                >
                                    Combined
                                </Button>
                                <Divider />
                                {quiz.submissions.map((submission, i) => (
                                    <Button
                                        variant={
                                            selectedAttemptIndex === i
                                                ? "solid"
                                                : "ghost"
                                        }
                                        colorScheme="teal"
                                        key={i}
                                        textAlign="left"
                                        onClick={() =>
                                            setSelectedAttemptIndex(i)
                                        }
                                        fontSize="sm"
                                    >
                                        Attempt #{submission.attempt} (
                                        {Math.round(submission.score * 100) /
                                            100}
                                        /{submission.quiz_points_possible})
                                    </Button>
                                ))}
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
                                    <Heading fontSize="xl">
                                        Attempt #
                                        {
                                            quiz.submissions[
                                                selectedAttemptIndex
                                            ].attempt
                                        }
                                    </Heading>

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
                                                        <QuestionResultTag
                                                            quiz={quiz}
                                                            questionResponse={
                                                                quiz
                                                                    .selectedOptions[
                                                                    selectedAttemptIndex
                                                                ][question.id]
                                                            }
                                                        />
                                                    </div>
                                                    <FlaggingButton
                                                        question={question}
                                                        quiz={quiz}
                                                        setQuiz={setQuiz}
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
                                                            ][question.id]
                                                        }
                                                        show_correct_answers={
                                                            quiz.quizInfo
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
    setQuiz: Dispatch<
        SetStateAction<
            | Quiz & {
                  id: string;
              }
        >
    >;
}) => {
    const [isFlagged, setIsFlagged] = useState(question.isFlagged);
    const toast = useToast();
    const handleFlagQuestion = async (questionId: number) => {
        try {
            const updatedQuizData = await updateQuizQuestionFlag(
                quiz,
                questionId,
                !isFlagged
            );
            setQuiz(updatedQuizData);
            setIsFlagged(!isFlagged);
            toast({
                ...SUCCESS_TOAST_OPTIONS,
                title: `Question ${!isFlagged ? "flagged" : "unflagged"}`,
            });
        } catch (e: any) {
            console.log(e);
            toast({
                ...ERROR_TOAST_OPTIONS,
                title: `Error ${
                    !isFlagged ? "flagging" : "unflagging"
                } question`,
                description: e.toString(),
            });
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
    setQuiz: Dispatch<
        SetStateAction<
            | Quiz & {
                  id: string;
              }
        >
    >;
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
    setQuiz: Dispatch<
        SetStateAction<
            | Quiz & {
                  id: string;
              }
        >
    >;
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

function DeleteAnnotationButton({
    ID,
    annotationID,
    setQuiz,
    question,
}: {
    ID: string;
    annotationID: number;
    question: QuizSubmissionQuestion;
    setQuiz: Dispatch<
        SetStateAction<
            | Quiz & {
                  id: string;
              }
        >
    >;
}) {
    const handleDelete = async () => {
        try {
            const existingQuiz = doc(db, COLLECTION_NAME, ID);
            const existingQuizData = (
                await getDoc(existingQuiz)
            ).data() as Quiz;
            const existingQuestions = existingQuizData.questions;
            const newQuestions = existingQuestions.map((qn) => {
                if (qn.id === question.id) {
                    qn.annotations = qn.annotations.filter(
                        (ann) => ann.annotationID !== annotationID
                    );
                }
                return qn;
            });
            existingQuizData.questions = newQuestions;
            await updateDoc(existingQuiz, existingQuizData);
            const updatedQuiz = {
                ...existingQuizData,
                id: ID,
            };
            setQuiz(updatedQuiz);
            return updatedQuiz;
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <IconButton
            aria-label="delete"
            icon={<TbTrashX />}
            size="sm"
            onClick={() => handleDelete()}
        />
    );
}
