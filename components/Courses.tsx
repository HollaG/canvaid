"use client";
import { MultipleQuizAttempt } from "@/types/canvas";
import { Box, Flex, Button, Text, Grid } from "@chakra-ui/react";
import Link from 'next/link'

const Courses = ({ multipleQuizAttempts }: { multipleQuizAttempts: MultipleQuizAttempt[] }) => {
    console.log(multipleQuizAttempts);
    const modules = multipleQuizAttempts.map((attempt, index) =>{ 
        const len = attempt.submission.length; // returns attempt at the end of the array
        return {
        name: attempt.course,
        quizzes: [{ id: attempt.submission[len - 1].id, name: attempt.quizName }],
        id: index,
        }}
    );

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

            <Text fontSize="xl" fontWeight="bold" mb={2} align={"center"}>
                Courses
            </Text>

            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {modules.map((module, moduleIndex) => (
                    <Box
                        key={module.id}
                        p={4}
                        border="1px solid"
                        borderRadius="md"
                    >
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                        <Link
                            href={{
                                pathname: '/course',
                                query: { name: module.name },
                            }}
                            >
                            {module.name}
                        </Link>
                        </Text>
                        {module.quizzes.map((quiz) => (
                            <li key =  {quiz.id}>
                                <Link href = {{
                                    pathname: '/quiz',
                                    query: { id: quiz.id },
                                }}>
                                    <Text key={quiz.id}>{quiz.name}</Text>
                                </Link>
                            </li>
                        ))}
                        <Flex justify="flex-end">
                            <Button
                                colorScheme="blue"
                                onClick={() => showAllQuizzes(moduleIndex)}
                            >
                                See All Quizzes
                            </Button>
                        </Flex>
                    </Box>
                ))}
            </Grid>
        </Box>
    );
};

export default Courses;
