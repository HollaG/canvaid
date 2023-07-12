"use client";
import { Quiz } from "@/types/canvas";
import { Box, Flex, Button, Text, Grid } from "@chakra-ui/react";
import Link from "next/link";
import QuizUploadCard from "./Home/QuizUploadCard";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import { CorePluginList } from "tailwindcss/types/generated/corePluginList";

export type QuizUploadProps = {
    name: string;
    quizzes: {
        id: number;
        name: string;
    }[];
    id: number;
};
type courseProps = {
    quizzes: (Quiz & { id: string })[];
    deletion: (itemid: string) => void;
};
const Courses = ({ quizzes, deletion }: courseProps) => {
    console.log(quizzes);

    // const modules = [
    //     {
    //         id: 1,
    //         name: "CS2040s",
    //         quizzes: [
    //             { id: 1, name: "Quiz 1" },
    //             { id: 2, name: "Quiz 2" },
    //             { id: 3, name: "Quiz 3" },
    //             { id: 4, name: "Quiz 4" },
    //             { id: 5, name: "Quiz 5" },
    //             // Add more quizzes as needed
    //         ],
    //         maxQuizzesToShow: 3,
    //     },
    //     {
    //         id: 2,
    //         name: "GEA1000",
    //         quizzes: [
    //             { id: 1, name: "Quiz 1" },
    //             { id: 2, name: "Quiz 2" },
    //             { id: 3, name: "Quiz 3" },
    //         ],
    //     },
    //     // Add more modules as needed
    // ];

    const showAllQuizzes = (moduleIndex: number) => {
        // Implement logic to handle "See All Quizzes" button click
        // Set state or perform an action to show all quizzes for the module
        console.log("Showing all quizzes for module", moduleIndex + 1);
    };

    return (
        <Box p={4}>
            {/* <Flex align="center" justify="space-between" mb={4}>
                <Button colorScheme="blue">Upload a Quiz</Button>
            </Flex> */}

            <Flex flexWrap="wrap">
                {quizzes.map((item, key) => (
                    <QuizUploadCard key={key} quiz={item} onDelete={deletion} />
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
