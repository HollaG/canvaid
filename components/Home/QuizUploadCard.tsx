import { useState } from "react";
import {
    Box,
    Heading,
    Text,
    Img,
    Flex,
    Center,
    useColorModeValue,
    HStack,
    Stack,
} from "@chakra-ui/react";
import { BsArrowUpRight, BsHeartFill, BsHeart } from "react-icons/bs";
import { QuizUploadProps } from "../Courses";
import { Quiz } from "@/types/canvas";
import { Timestamp } from "firebase/firestore";
import DeleteButton from "../DeleteButton"

import NextLink from "next/link";

export default function QuizUploadCard({
    quiz, onDelete
}: {
    quiz: Quiz & { id: string },  onDelete : (itemid: string) => void;
}) {
    const [liked, setLiked] = useState(false);
    const handleDelete = () => {
        onDelete(quiz.id);
    }
    return (
        <Box py={6} height="100%">
        

            <Box
                // height="100%"
                w="xs"
                rounded={"sm"}
                my={5}
                mx={[0, 5]}
                overflow={"hidden"}
                bg="white"
                border={"1px"}
                borderColor="black"
                // boxShadow={useColorModeValue(
                //     "6px 6px 0 black",
                //     "6px 6px 0 cyan"
                // )}
            >
                {/* <Box h={"200px"} borderBottom={"1px"} borderColor="black">
                    <Img
                        src={
                            "https://images.unsplash.com/photo-1542435503-956c469947f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                        }
                        roundedTop={"sm"}
                        objectFit="cover"
                        h="full"
                        w="full"
                        alt={"Blog Image"}
                    />
                </Box> */}
                <Box p={4}>
                    <Box
                        bg="black"
                        display={"inline-block"}
                        px={2}
                        py={1}
                        color="white"
                        mb={2}
                    >
                        <Text fontSize={"xs"} fontWeight="medium">
                            {quiz.course}
                        </Text>
                        
                    </Box>
                    <Heading color={"black"} fontSize={"2xl"} noOfLines={1}>
                        {quiz.quizName}
                    </Heading>
                    
                    {quiz.submissions.map((submission, index) => (
                        <Stack key={index} spacing={1}>
                            <Text>
                                {" "}
                                Attempt #{index + 1}:{" "}
                                {Math.round(submission.score * 100) / 100 ?? 0}{" "}
                                / {submission.quiz_points_possible ?? 0}
                            </Text>
                            <Text fontWeight="light" fontSize="xs">
                                Submitted at{" "}
                                {new Date(
                                    submission.finished_at
                                ).toLocaleString()}
                            </Text>
                        </Stack>
                    ))}
                    {/* <Text color={"gray.500"} noOfLines={2}>
                        In this post, we will give an overview of what is new in
                        React 18, and what it means for the future.
                    </Text> */}
                    
                </Box>
                <DeleteButton ID = {quiz.id} onDelete = {handleDelete}/>
                <HStack borderTop={"1px"} color="black">
                    <Flex
                        p={4}
                        alignItems="center"
                        justifyContent={"space-between"}
                        roundedBottom={"sm"}
                        cursor={"pointer"}
                        w="full"
                        as={NextLink}
                        href={`/uploads/${quiz.id}`}
                    >
                        <Text fontSize={"md"} fontWeight={"semibold"}>
                            View quiz
                        </Text>
                        <BsArrowUpRight />
                    </Flex>
                    <Flex
                        p={4}
                        alignItems="center"
                        justifyContent={"space-between"}
                        roundedBottom={"sm"}
                        borderLeft={"1px"}
                        cursor="pointer"
                        onClick={() => setLiked(!liked)}
                    >
                        {liked ? (
                            <BsHeartFill fill="red" fontSize={"24px"} />
                        ) : (
                            <BsHeart fontSize={"24px"} />
                        )}
                    </Flex>
                </HStack>
            </Box>
        </Box>
    );
}
