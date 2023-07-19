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
    Card,
    CardHeader,
    Badge,
    IconButton,
    CardBody,
    CardFooter,
    Stepper,
    Step,
    StepIndicator,
    StepStatus,
    StepTitle,
    StepDescription,
    useSteps,
    StepSeparator,
    useMediaQuery,
} from "@chakra-ui/react";
import {
    BsArrowUpRight,
    BsHeartFill,
    BsHeart,
    BsTrash,
    BsThreeDotsVertical,
} from "react-icons/bs";
import { QuizUploadProps } from "../Courses";
import { Quiz } from "@/types/canvas";
import { Timestamp } from "firebase/firestore";
import DeleteButton from "../DeleteButton";

import NextLink from "next/link";
import { convertCustomAttemptNumber, formatTimeElapsed } from "@/lib/functions";
import { TimeIcon } from "@chakra-ui/icons";

import styles from "./QuizUploadCard.module.css";
import Link from "next/link";
import CourseInfo from "../Display/CourseInfo";

export default function QuizUploadCard({
    quiz,
    onDelete,
}: {
    quiz: Quiz & { id: string };
    onDelete: (itemid: string) => void;
}) {
    const [liked, setLiked] = useState(false);
    const handleDelete = () => {
        onDelete(quiz.id);
    };

    // order the submissions according to the attempt number in reverse order
    const sortedSubmissions = structuredClone(quiz.submissions).sort(
        (a, b) => b.attempt - a.attempt
    );

    const hasMoreThan3 = sortedSubmissions.length > 3;
    // slice it to only show the last 3 submissions
    const lastThreeSubmissions = sortedSubmissions.slice(0, 3);

    const { activeStep } = useSteps({
        index: 0,
        count: lastThreeSubmissions.length,
    });

    // Custom size
    const [shouldNotBeFullWidth] = useMediaQuery("(min-width: 1033px)");

    return (
        <Box
            flexGrow={1}
            maxWidth={!shouldNotBeFullWidth ? "full" : "400px"}
            mb={4}
        >
            <Box
                cursor="pointer"
                flexGrow={1}
                mx={6}
                borderRadius={"xl"}
                position="relative"
                _hover={{
                    transform: "scale(1.01)",
                }}
                transition="transform 0.2s ease-in-out"
                // boxShadow={"md"}
                className={`wrapper`}
                boxShadow={"sm"}
            >
                <Box
                    position="absolute"
                    borderRadius="xl"
                    boxShadow={"md"}
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    transition="opacity 0.2s ease-in-out"
                    opacity={0}
                    className="cust-shadow"
                ></Box>
                <Link href={`/uploads/${quiz.id}`}>
                    <Card boxShadow="0">
                        <CardHeader>
                            {/* <Flex justifyContent={"space-between"} alignItems="center">
                    <Box>
                        <Badge fontSize="lg">
                            {" "}
                            {quiz.course.split(" ")[0]}{" "}
                        </Badge>
                        <Text fontSize={"sm"} fontWeight="light">
                            {quiz.course.split(" ").slice(1).join(" ")}
                        </Text>
                    </Box>
                    <IconButton
                        variant="ghost"
                        colorScheme="gray"
                        aria-label="See menu"
                        icon={<BsThreeDotsVertical />}
                    />
                </Flex> */}

                            <CourseInfo
                                courseCode={quiz.course.split(" ")[0]}
                                courseName={quiz.course
                                    .split(" ")
                                    .slice(1)
                                    .join(" ")}
                            />
                        </CardHeader>
                        <CardBody pt={0}>
                            <Heading fontSize="lg" mb={3}>
                                {" "}
                                {quiz.quizName}
                            </Heading>
                            {/* {quiz.submissions.map((submission, index) => (
                    <Stack key={index} spacing={1}>
                        <Text>
                            {" "}
                            Attempt #{index + 1}:{" "}
                            {Math.round(submission.score * 100) / 100 ?? 0} /{" "}
                            {submission.quiz_points_possible ?? 0}
                        </Text>
                    </Stack>
                ))} */}
                            <Stepper
                                size="sm"
                                index={activeStep}
                                orientation="vertical"
                            >
                                {sortedSubmissions.map((submission, i) => (
                                    <Step key={i}>
                                        <StepIndicator fontSize={"xs"}>
                                            <StepStatus
                                                complete={convertCustomAttemptNumber(
                                                    submission.attempt
                                                )}
                                                incomplete={convertCustomAttemptNumber(
                                                    submission.attempt
                                                )}
                                                active={convertCustomAttemptNumber(
                                                    submission.attempt
                                                )}
                                            />
                                        </StepIndicator>
                                        <Box flexShrink={0} minH="48px">
                                            <StepTitle>
                                                {" "}
                                                {Math.round(
                                                    submission.score * 100
                                                ) / 100 ?? 0}{" "}
                                                /{" "}
                                                {submission.quiz_points_possible ??
                                                    0}{" "}
                                            </StepTitle>
                                            <StepDescription>
                                                {" "}
                                                {formatTimeElapsed(
                                                    new Date(
                                                        submission.finished_at
                                                    )
                                                )}{" "}
                                            </StepDescription>
                                        </Box>
                                        <StepSeparator />
                                    </Step>
                                ))}
                                {hasMoreThan3 && <StepSeparator />}
                            </Stepper>
                        </CardBody>

                        <CardFooter>
                            {/* <Text alignItems={"center"} display="flex">
                    <TimeIcon mr={2} />

                    {formatTimeElapsed(
                        new Date(
                            quiz.submissions.sort(
                                (a, b) =>
                                    new Date(a.finished_at).getTime() -
                                    new Date(b.finished_at).getTime()
                            )[0].finished_at
                        )
                    )}
                </Text> */}
                        </CardFooter>
                    </Card>
                </Link>
            </Box>
        </Box>
    );
}
