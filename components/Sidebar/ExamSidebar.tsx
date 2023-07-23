"use client";
import { useQuizContainer } from "@/app/providers";
import { Stack, Box, Text, Flex, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { QuizSubmissionQuestion, QuizResponse } from "@/types/canvas";

import { TbCheck, TbX } from "react-icons/tb";
import Timer from "@/components/Timer/Timer";
import { usePathname, useRouter } from "next/navigation";

const steps = [
    { title: "First", description: "Contact Info" },
    { title: "Second", description: "Date & Time" },
    { title: "Third", description: "Select Rooms" },
];

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

    const pathname = usePathname();
    console.log(pathname);

    /**
     * Not a very React-way to scroll
     *
     * @param qnNum the question number to scroll to (1-indexed)
     */
    const scrollTo = (qnNum: number) => {
        const elem = document.getElementById("question-" + qnNum);
        if (elem) {
            elem.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <Stack justifyContent={"center"} spacing={3}>
            {examLength != 0 && <Timer startTimeInMinutes={examLength} />}
            {questions?.map((qn, i) => (
                <Flex align="center">
                    <Box
                        borderRadius={"full"}
                        bgColor={
                            selectedOption[qn.id]?.selected_answer_ids ||
                            selectedOption[qn.id]?.answer_text
                                ? useColorModeValue("teal.500", "teal.500")
                                : "unset"
                        }
                        borderColor={
                            selectedOption[qn.id]?.selected_answer_ids ||
                            selectedOption[qn.id]?.answer_text
                                ? useColorModeValue("teal.500", "teal.500")
                                : useColorModeValue("gray.500", "gray.500")
                        }
                        borderWidth={"1px"}
                        outline={0}
                        p={"0.175em"}
                    >
                        {selectedOption[qn.id]?.selected_answer_ids ||
                        selectedOption[qn.id]?.answer_text ? (
                            <TbCheck color={"white"} fontSize="0.75em" />
                        ) : (
                            <TbX fontSize="0.75em" />
                        )}
                    </Box>
                    <Text
                        ml={2}
                        onClick={() => scrollTo(i + 1)}
                        cursor="pointer"
                        _hover={{
                            textDecor: "underline",
                        }}
                        fontSize="sm"
                    >
                        {"Question " + (i + 1)}
                    </Text>
                </Flex>
            ))}
        </Stack>
    );
};
