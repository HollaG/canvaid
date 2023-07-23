"use client";
import { useQuizContainer } from "@/app/providers";
import { Stack, Box, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { QuizSubmissionQuestion, QuizResponse } from "@/types/canvas";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

import { TbCheck, TbX } from "react-icons/tb";
import Timer from "../Timer/timer";
export const ExamSidebar = ({
    questions,
    selectedOption,
    examLength,
}: {
    questions: QuizSubmissionQuestion[] | undefined;
    selectedOption: QuizResponse;
    examLength: number;
}) => {
    if (
        examLength == undefined ||
        examLength == null ||
        Number.isNaN(examLength)
    ) {
        examLength = 0;
    }
    return (
        <Stack>
            {examLength != 0 && <Timer startTimeInMinutes={examLength} />}
            {questions?.map((qn, i) => (
                <Flex
                    align="center"
                    justifyContent={"space-between"}
                    // marginRight={5}
                >
                    <Text>{"Question " + (i + 1)}</Text>
                    <Box marginRight={13}>
                        {selectedOption[qn.id]?.selected_answer_ids ||
                        selectedOption[qn.id]?.answer_text ? (
                            <TbCheck />
                        ) : (
                            <TbX />
                        )}
                    </Box>
                </Flex>
            ))}
            {/* {questions?.map((qn, i) => {
                return (
                    <Flex align="center">
                        <Text>{"Question " + (i + 1)}</Text>

                        {selectedOption[qn.id]?.selected_answer_ids ||
                        selectedOption[qn.id]?.answer_text ? (
                            <CheckIcon ml={3} />
                        ) : (
                            <CloseIcon ml={3} />
                        )}
                    </Flex>
                );
                
            })} */}
        </Stack>
    );
};
