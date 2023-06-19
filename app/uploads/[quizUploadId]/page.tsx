"use client";

import { getQuizUpload } from "@/firebase/database/repositories/uploads";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { Answer, QuestionResponse, Quiz, QuizResponse } from "@/types/canvas";
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
import { useParams, useRouter } from "next/navigation";
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
                                        <Heading fontSize="lg">
                                            {" "}
                                            Question {question.position}
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

/**
 *
 * @param param0 Per-question answer list
 * @returns
 */
const AnswerList = ({
    questionType,
    answers,
    selectedOptions,
}: {
    questionType: string;
    answers: Answer[];
    selectedOptions: QuestionResponse;
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
                            <Flex alignItems={"center"}>
                                <Box width="100px" textAlign={"end"} mr={3}>
                                    {selectedOptions.correct_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        !selectedOptions.selected_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="yellow">
                                                Correct!{" "}
                                            </Badge>
                                        )}
                                    {selectedOptions.correct_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        selectedOptions.selected_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="green">
                                                Correct!{" "}
                                            </Badge>
                                        )}
                                    {selectedOptions.selected_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        !selectedOptions.correct_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="red">
                                                Incorrect!{" "}
                                            </Badge>
                                        )}
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
            console.log({ userSelected });
            return (
                <CheckboxGroup value={userSelected}>
                    <Stack spacing={4}>
                        {answers.map((answer, i) => (
                            <Flex alignItems={"center"}>
                                <Box width="100px" textAlign={"end"} mr={3}>
                                    {selectedOptions.correct_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        !selectedOptions.selected_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="yellow">
                                                Correct!{" "}
                                            </Badge>
                                        )}
                                    {selectedOptions.correct_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        selectedOptions.selected_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="green">
                                                Correct!{" "}
                                            </Badge>
                                        )}
                                    {selectedOptions.selected_answer_ids?.includes(
                                        answer.id
                                    ) &&
                                        !selectedOptions.correct_answer_ids?.includes(
                                            answer.id
                                        ) && (
                                            <Badge colorScheme="red">
                                                Incorrect!{" "}
                                            </Badge>
                                        )}
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
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;

        default:
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;
    }
};
