"use client";

import { getQuizUpload } from "@/firebase/database/repositories/uploads";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Answer,
    QuestionResponse,
    Quiz,
    QuizResponse,
    QuizSubmissionQuestion,
} from "@/types/canvas";
import {
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
    Tag,
    Text,
} from "@chakra-ui/react";
import {
    useParams,
    useRouter,
    useSelectedLayoutSegment,
} from "next/navigation";
import { useEffect, useState } from "react";

/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const params = useParams();
    const dataId = params.quizUploadId;
    const [quiz, setQuiz] = useState<Quiz & { id: string }>();
    useEffect(() => {
        if (dataId)
            getQuizUpload(dataId)
                .then(setQuiz)
                .catch((e) => {
                    console.log(e);
                });
    }, [dataId]);

    const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);
    console.log(quiz);

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
                        Total questions: {quiz.quizInfo.question_count}
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
                            <Button variant="outline" colorScheme="green">
                                {" "}
                                Highest{" "}
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
                        <Stack>
                            <Text>
                                Attempt{" "}
                                {quiz.submissions[selectedAttemptIndex].attempt}{" "}
                            </Text>
                            <Divider />
                            {/* {quiz} */}
                            <Stack spacing="10">
                                {quiz.questions.map((question, i) => (
                                    <Box key={i}>
                                        <Heading
                                            fontSize="lg"
                                            alignItems={"center"}
                                        >
                                            {" "}
                                            Question {question.position}{" "}
                                            <QuestionResultTag
                                                question={question}
                                                quiz={quiz}
                                                selectedAttemptIndex={
                                                    selectedAttemptIndex
                                                }
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
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    </GridItem>
                </Grid>
            </Stack>
        </Container>
    );
}

const QuestionResultTag = ({
    quiz,
    selectedAttemptIndex,
    question,
}: {
    quiz: Quiz;
    selectedAttemptIndex: number;
    question: QuizSubmissionQuestion;
}) => {
    const showCorrectAnswers = quiz.quizInfo.show_correct_answers;

    // if the question is correct
    if (
        quiz.selectedOptions[selectedAttemptIndex][question.id].your_score ===
        quiz.selectedOptions[selectedAttemptIndex][question.id].total_score
    ) {
        return (
            <Tag colorScheme="green">
                Correct! (
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .your_score
                }{" "}
                /{" "}
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .total_score
                }
                )
            </Tag>
        );
        // return <Tag colorScheme="green"> Correct! </Tag>;
    }

    // if the question is incorrect
    if (
        quiz.selectedOptions[selectedAttemptIndex][question.id].your_score === 0
    ) {
        // return <Tag colorScheme="red"> Incorrect! </Tag>;
        return (
            <Tag colorScheme="red">
                Incorrect! (
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .your_score
                }{" "}
                /{" "}
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .total_score
                }
                ){" "}
            </Tag>
        );
    }

    // if the question is not yet graded (score = -1)
    if (
        quiz.selectedOptions[selectedAttemptIndex][question.id].your_score ===
        -1
    ) {
        return <Tag colorScheme="gray"> Not yet graded! </Tag>;
    }

    // if the question is partially answered
    if (
        quiz.selectedOptions[selectedAttemptIndex][question.id].your_score !==
        quiz.selectedOptions[selectedAttemptIndex][question.id].total_score
    ) {
        return (
            <Tag colorScheme="yellow">
                Partial! (
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .your_score
                }{" "}
                /{" "}
                {
                    quiz.selectedOptions[selectedAttemptIndex][question.id]
                        .total_score
                }
                ){" "}
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
                                        (ans) => (
                                            <Text>{ans}</Text>
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
