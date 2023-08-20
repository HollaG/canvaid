import { create } from "@/firebase/database/repositories/uploads";
import {
    Quiz,
    QuizResponse,
    CanvasQuizSubmission,
    QuizAttempt,
    Answer,
    QuestionResponse,
    QuizSubmissionQuestion,
} from "@/types/canvas";
import {
    useColorModeValue,
    Tag,
    Stack,
    Flex,
    Heading,
    Divider,
    Button,
    RadioGroup,
    Radio,
    CheckboxGroup,
    Checkbox,
    Box,
    Input,
    Text,
} from "@chakra-ui/react";

import { useRouter } from "next/router";

import { Dispatch, SetStateAction, useState } from "react";

export const ExamAnswerList = ({
    // questionType,
    // answers,
    selectedOptions,
    setSelectedOptions,
    question,
}: {
    question: QuizSubmissionQuestion;
    selectedOptions: QuizResponse; // a single question
    setSelectedOptions: Dispatch<SetStateAction<QuizResponse>>;
}) => {
    const questionType = question.question_type;
    const answers = question.answers;
    const questionId = question.id;
    switch (questionType) {
        case "multiple_choice_question":
        case "true_false_question":
            return (
                <RadioGroup
                    value={(
                        selectedOptions[questionId]?.selected_answer_ids?.[0] ??
                        ""
                    ).toString()}
                    onChange={(value) => {
                        // value is a single
                        // setSelectedAnswer(value);
                        // selectedOptions.selected_answer_ids = [
                        //     parseInt(selectedAnswer),
                        // ];

                        setSelectedOptions((prev) => {
                            return {
                                ...prev,
                                [questionId]: {
                                    selected_answer_ids: [parseInt(value)],
                                },
                            };
                        });
                    }}
                >
                    <Stack divider={<Divider />} spacing={4}>
                        {answers.map((answer, i) => (
                            <Flex alignItems="center" key={i}>
                                {/* <Box width="100px" textAlign="end" mr={3}></Box> */}
                                <Radio key={i} value={answer.id.toString()}>
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
            return (
                <CheckboxGroup
                    value={
                        selectedOptions[questionId]?.selected_answer_ids?.map(
                            (id) => id.toString()
                        ) || []
                    }
                    onChange={(e) => {
                        // if no selecetd option, delete it from the object
                        if (e.length === 0) {
                            setSelectedOptions((prev) => {
                                const newPrev = { ...prev };
                                delete newPrev[questionId];
                                return newPrev;
                            });
                        } else
                            setSelectedOptions((prev) => ({
                                ...prev,
                                [questionId]: {
                                    selected_answer_ids: e.map((id) =>
                                        parseInt(id.toString())
                                    ),
                                },
                            }));
                    }}
                >
                    <Stack spacing={4} divider={<Divider />}>
                        {answers.map((answer, i) => (
                            <Flex alignItems="center" key={i}>
                                {/* <Box width="100px" textAlign="end" mr={3}></Box> */}
                                <Checkbox key={i} value={answer.id.toString()}>
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
                    <Flex alignItems="center">
                        {/* <Box width="100px" textAlign="end" mr={3}></Box> */}
                        <Box>
                            <Stack spacing={1}>
                                <Text
                                    fontWeight="semibold"
                                    textDecoration="underline"
                                >
                                    Your answer
                                </Text>
                                <Input
                                    placeholder="Insert Answer Here"
                                    value={
                                        selectedOptions[questionId]
                                            ?.answer_text?.[0] ?? ""
                                    }
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setSelectedOptions((prev) => {
                                                const newPrev = {
                                                    ...prev,
                                                };
                                                delete newPrev[questionId];
                                                return newPrev;
                                            });
                                        } else
                                            setSelectedOptions((prev) => ({
                                                ...prev,
                                                [questionId]: {
                                                    answer_text: [
                                                        e.target.value,
                                                    ],
                                                },
                                            }));
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Flex>
                </Stack>
            );

        default:
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;
    }
};
