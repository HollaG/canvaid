"use client";

import { getQuizUpload } from "@/firebase/database/repositories/uploads";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { Answer, QuestionResponse, Quiz, QuizResponse } from "@/types/canvas";
import {
    Box,
    Button,
    Checkbox,
    CheckboxGroup,
    Container,
    Divider,
    Grid,
    GridItem,
    Heading,
    Radio,
    RadioGroup,
    Stack,
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
    console.log(quiz);
    useEffect(() => {
        if (dataId)
            getQuizUpload(dataId)
                .then(setQuiz)
                .catch((e) => {
                    console.log(e);
                });
    }, [dataId]);

    const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);

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
    console.log(answers, "---------------");
    switch (questionType) {
        case "multiple_choice_question":
            return (
                <RadioGroup
                    defaultValue={
                        selectedOptions.selected_answer_ids?.[0].toString() ??
                        "0"
                    }
                >
                    <Stack>
                        {answers.map((answer, i) => (
                            <Radio
                                key={i}
                                value={answer.id.toString()}
                                isReadOnly
                            >
                                {" "}
                                {answer.text ?? answer.html}{" "}
                            </Radio>
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
                <CheckboxGroup defaultValue={userSelected}>
                    <Stack>
                        {answers.map((answer, i) => (
                            <Checkbox
                                key={i}
                                value={answer.id.toString()}
                                isReadOnly
                            >
                                {" "}
                                {answer.text ?? answer.html}{" "}
                            </Checkbox>
                        ))}
                    </Stack>
                </CheckboxGroup>
            );

        case "essay_question":
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;

        default:
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;
    }
};
