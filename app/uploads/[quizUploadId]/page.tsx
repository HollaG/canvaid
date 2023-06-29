"use client";
import {
    getQuizUpload,
    updateQuizQuestionAnnotation,
    updateQuizQuestionFlag,
} from "@/firebase/database/repositories/uploads";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Answer,
    QuestionResponse,
    Quiz,
    QuizResponse,
    CanvasQuizSubmissionQuestion,
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
} from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
import { db } from "@/firebase/database";
import {
    collection,
    getDocs,
    updateDoc,
    query,
    where,
} from "firebase/firestore";
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
import { FaFlag } from "react-icons/fa";

/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const params = useParams();
    const dataId = params.quizUploadId;

    const [questionInputs, setQuestionInputs] = useState<string>("");
    const [quiz, setQuiz] = useState<Quiz & { id: string }>();
    // const [quizAnnotations, setQuizAnnotations] = useState(
    //     quiz?.questions.map((qn) => ({stateid:qn.id, stateAnnotation: qn.annotations}))
    // );
    const [updatedQuiz, setUpdatedQuiz] = useState<Quiz | undefined>(undefined);

    useEffect(() => {
        if (dataId)
            getQuizUpload(dataId)
                .then(setQuiz)
                .catch((e) => {
                    console.log(e);
                });
    }, [dataId]);

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
    if (!quiz)
        return <Container maxW={PAGE_CONTAINER_SIZE}>Loading...</Container>;
    return (
        <Container maxW={PAGE_CONTAINER_SIZE}>
            <Stack spacing={6}>
                <Heading>
                    {" "}
                    {quiz.course}: {quiz.quizName}{" "}
                </Heading>
                <Flex flexDir={"row"} flexWrap="wrap">
                    {quiz.quizInfo.show_correct_answers ? (
                        <Tag colorScheme={"green"} mr={2}>
                            Correct answers are shown
                        </Tag>
                    ) : (
                        <Tag colorScheme={"red"} mr={2}>
                            Correct answers are hidden
                        </Tag>
                    )}
                    <Tag colorScheme={"green"}>
                        {" "}
                        Total questions seen: {quiz.questions.length}
                    </Tag>
                </Flex>
                <Box
                    dangerouslySetInnerHTML={{
                        __html: quiz.quizInfo.description,
                    }}
                />
                <Divider />

                <Grid gridTemplateColumns={{ base: "1fr", md: "200px 1fr" }}>
                    <GridItem p={5}>
                        {" "}
                        <Stack>
                            <Button
                                variant={
                                    selectedAttemptIndex === -1
                                        ? "solid"
                                        : "outline"
                                }
                                colorScheme="green"
                                onClick={() => setSelectedAttemptIndex(-1)}
                            >
                                {" "}
                                Combined{" "}
                            </Button>
                            <Divider />
                            {quiz.submissions.map((submission, i) => (
                                <Button
                                    variant={
                                        selectedAttemptIndex === i
                                            ? "solid"
                                            : "ghost"
                                    }
                                    colorScheme="green"
                                    key={i}
                                    textAlign="left"
                                    onClick={() => setSelectedAttemptIndex(i)}
                                >
                                    {" "}
                                    Attempt #{submission.attempt} (
                                    {Math.round(submission.score * 100) / 100}/
                                    {submission.quiz_points_possible})
                                </Button>
                            ))}
                        </Stack>{" "}
                    </GridItem>
                    <GridItem p={5}>
                        {" "}
                        {selectedAttemptIndex === -1 ? (
                            <CombinedQuestionList
                                quiz={quiz}
                                setQuiz={setQuiz}
                            />
                        ) : (
                            <Stack>
                                <Heading fontSize="xl">
                                    Attempt{" "}
                                    {
                                        quiz.submissions[selectedAttemptIndex]
                                            .attempt
                                    }{" "}
                                </Heading>
                                <Divider />
                                {/* {quiz} */}
                                <Stack spacing="10">
                                    {/* We need to get the question IDs that were in this attempt, which may not be all the questions */}

                                    {getQuestionsForAttempt(
                                        selectedAttemptIndex
                                    ).map((question, i) => (
                                        <Box key={i} >
                                            <Heading
                                                fontSize="lg"
                                                alignItems={"center"} display = "flex" justifyContent={"space-between"}
                                            >
                                                <div>
                                                {" "}
                                                Question {i + 1}{" "}
                                                <QuestionResultTag
                                                    quiz={quiz}
                                                    questionResponse={
                                                        quiz.selectedOptions[
                                                            selectedAttemptIndex
                                                        ][question.id]
                                                    }
                                                />
                                                </div>
                                                <FlaggingButton question = {question} quiz={quiz} setQuiz={setQuiz}/>
                                            </Heading>
                                            {/* https://stackoverflow.com/questions/23616226/insert-html-with-react-variable-statements-jsx */}
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
                                                    answers={question.answers}
                                                    selectedOptions={
                                                        quiz.selectedOptions[
                                                            selectedAttemptIndex
                                                        ] &&
                                                        quiz.selectedOptions[
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
                                            
                                            
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        )}
                    </GridItem>
                </Grid>
            </Stack>
        </Container>
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
            | (Quiz & {
                  id: string;
              })
            | undefined
        >
    >;
})  => {
    const [isFlagged, setIsFlagged] = useState(question.isFlagged);
    const handleFlagQuestion = async (questionId: number) => {
        try {
            const updatedQuizData = await updateQuizQuestionFlag(
                quiz,
                questionId,
                isFlagged
            );
            setQuiz(updatedQuizData);
            setIsFlagged(!isFlagged);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <IconButton
            aria-label="flag question"
            icon={<FaFlag />}
            onClick={() => {
                handleFlagQuestion(question.id)
            }}
            colorScheme={question.isFlagged? "red" : "gray"}
        />
    )


}
const QuestionExtras = ({
    question,
    quiz,
    setQuiz,
}: {
    question: QuizSubmissionQuestion;
    quiz: Quiz & { id: string };
    setQuiz: Dispatch<
        SetStateAction<
            | (Quiz & {
                  id: string;
              })
            | undefined
        >
    >;
}) => {
    // const [isChatboxOpen, setIsChatboxOpen] = useState(false);
    const [newAnnotation, setNewAnnotation] = useState("");
    const handleSubmitAnnotation = async (event: FormEvent, i: number) => {
        event.preventDefault();

        try {
            const updatedQuizData = await updateQuizQuestionAnnotation(
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
                        colorScheme={"green"}
                        size="sm"
                        variant="ghost"
                    >
                        Submit
                    </Button>
                </Flex>
            </form>

            <Stack>
                {question.annotations.length &&
                    question.annotations.map((annotation, i) => (
                        <Text key={i}> {annotation}</Text>

                    ))}
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
            <Tag colorScheme="green">
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
            <Tag colorScheme="red">
                Incorrect! ({questionResponse.your_score} /{" "}
                {questionResponse.total_score}){" "}
            </Tag>
        );
    }

    // if the question is not yet graded (score = -1)
    if (questionResponse.your_score === -1) {
        return <Tag colorScheme="gray"> Not yet graded! </Tag>;
    }

    // if the question is partially answered
    if (questionResponse.your_score !== questionResponse.total_score) {
        return (
            <Tag colorScheme="yellow">
                Partial! ({questionResponse.your_score} /{" "}
                {questionResponse.total_score}){" "}
            </Tag>
        );
        // return <Tag colorScheme="yellow"> Partial! </Tag>;
    }

    return <Tag> Could not parse result! </Tag>;
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
            | (Quiz & {
                  id: string;
              })
            | undefined
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

    console.log({ combinedQuestions });

    return (
        <Stack spacing="10">
            <Heading fontSize="xl">
                {" "}
                Showing best results for each question{" "}
            </Heading>
            {combinedQuestions.map((question, i) => (
                <Box key={i}>
                    <Heading fontSize="lg" alignItems={"center"}>
                        {" "}
                        Question {i + 1}{" "}
                        <QuestionResultTag
                            quiz={quiz}
                            questionResponse={question.best_attempt}
                        />
                        <FlaggingButton question = {question} setQuiz = {setQuiz} quiz={quiz}/>
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
                                Best attempt (#{
                                    question.best_attempt_number
                                } - {question.best_attempt.your_score} /{" "}
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
                                        d.i !== question.best_attempt_number - 1
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
                                        d.i !== question.best_attempt_number - 1
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
            ))}
        </Stack>
    );

    //

    // <Stack spacing="10">

    // </Stack>
};
