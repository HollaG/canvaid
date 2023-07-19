"use client";
import { Quiz } from "@/types/canvas";
import {
    Box,
    Flex,
    Button,
    Text,
    Grid,
    Center,
    Heading,
    Collapse,
    useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import QuizUploadCard from "./Home/QuizUploadCard";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import { CorePluginList } from "tailwindcss/types/generated/corePluginList";

import EmptyImage from "@/public/assets/empty.svg";
import Image from "next/image";
import { TbClock, TbPinnedFilled } from "react-icons/tb";
import { useQuizContainer } from "@/app/providers";

export type QuizUploadProps = {
    name: string;
    quizzes: {
        id: number;
        name: string;
    }[];
    id: number;
};
type CourseProps = {
    onAddNew: () => void;
};
const Courses = ({ onAddNew }: CourseProps) => {
    const { quizzes, searchString } = useQuizContainer();
    const pinnedQuizzes = quizzes.filter((quiz) => quiz.quizSettings.isPinned);
    const filteredQuizzes = quizzes.filter((quiz) => {
        return (
            quiz.quizName.toLowerCase().includes(searchString.toLowerCase()) ||
            quiz.course.toLowerCase().includes(searchString.toLowerCase())
        );
    });

    const helperColor = useColorModeValue("gray.600", "gray.400");

    return (
        <Box p={4}>
            {/* <Flex align="center" justify="space-between" mb={4}>
                <Button colorScheme="blue">Upload a Quiz</Button>
            </Flex> */}

            {/* <Text
                textColor={"gray.600"}
                fontWeight="bold"
                fontSize="sm"
                mb={3}
                ml={6}
            >
                Pinned (0)
            </Text> */}
            {/* TODO */}

            <Collapse in={!!pinnedQuizzes.length}>
                <Text
                    textColor={helperColor}
                    fontWeight="bold"
                    fontSize="sm"
                    mb={3}
                    ml={6}
                    display="flex"
                    alignItems={"center"}
                    gap={1}
                >
                    <TbPinnedFilled /> Pinned
                </Text>
                <Flex flexWrap="wrap">
                    {pinnedQuizzes.map((item, key) => (
                        <QuizUploadCard key={key} quiz={item} />
                    ))}
                </Flex>
            </Collapse>

            {quizzes.length ? (
                <Text
                    textColor={helperColor}
                    fontWeight="bold"
                    fontSize="sm"
                    mb={3}
                    ml={6}
                    display="flex"
                    alignItems={"center"}
                    gap={1}
                >
                    <TbClock /> Recent
                </Text>
            ) : (
                <Box>
                    <Center>
                        <Box maxW="300px">
                            <Image
                                src={EmptyImage}
                                alt="Image representing that there is nothing here"
                            />
                        </Box>
                    </Center>
                    <Heading textAlign={"center"} mt={4} fontSize="xl">
                        You don't have any quizzes yet!
                    </Heading>
                    <Text textAlign={"center"} mt={2}>
                        Start adding by clicking the button below.
                    </Text>
                    <Center mt={5}>
                        <Button size="sm" onClick={onAddNew}>
                            Upload
                        </Button>
                    </Center>
                </Box>
            )}
            <Flex flexWrap="wrap">
                {filteredQuizzes.map((item, key) => (
                    <QuizUploadCard key={key} quiz={item} />
                ))}
            </Flex>

            {/* <Grid templateColumns="repeat(3, 1fr)" alignItems={"start"}>
                {quizzes.map((item, key) => (
                    <QuizUploadCard key={key} quiz={item} onDelete={deletion} />
                ))}
            </Grid> */}
        </Box>
    );
};

export default Courses;
