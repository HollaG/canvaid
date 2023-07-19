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
    Divider,
    useToast,
    useDisclosure,
    Button,
    Icon,
} from "@chakra-ui/react";

import { QuizUploadProps } from "../Courses";
import { Quiz } from "@/types/canvas";
import { Timestamp } from "firebase/firestore";
import DeleteButton from "../DeleteButton";

import NextLink from "next/link";

import {
    convertCustomAttemptNumber,
    formatTimeElapsed,
    getAcademicYearAndSemester,
} from "@/lib/functions";
import { DeleteIcon, TimeIcon } from "@chakra-ui/icons";

import styles from "./QuizUploadCard.module.css";
import Link from "next/link";
import CourseInfo from "../Display/CourseInfo";
import { TbPin, TbPinnedFilled, TbTrash, TbTrashX } from "react-icons/tb";
import {
    deleteQuiz,
    togglePinQuiz,
} from "@/firebase/database/repositories/uploads";
import { SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import CustomAlertDialog from "../Alert/CustomAlertDialog";
import { useAuthContainer } from "@/app/providers";
import { ACADEMIC_SEMESTER, ACADEMIC_YEAR } from "@/lib/constants";

export default function QuizUploadCard({
    quiz,
}: {
    quiz: Quiz & { id: string };
}) {
    const toast = useToast();
    const authCtx = useAuthContainer();
    const user = authCtx.user;
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

    // pin
    const pinQuiz = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // It's nested in a link, so the default action is actually to go to the URL.
        // e.stopPropagation doesn't do anything
        e.preventDefault();
        togglePinQuiz(quiz.id)
            .then((res) => {
                // alert

                const pinned = res.isPinned;
                if (pinned) {
                    toast({
                        ...SUCCESS_TOAST_OPTIONS,
                        title: "Pinned quiz!",
                    });
                } else {
                    toast({
                        ...SUCCESS_TOAST_OPTIONS,
                        title: "Unpinned quiz!",
                    });
                }
            })
            .catch((e) => {
                // alert
                console.log("unpinned");
            });
    };

    // delete
    const alertDeleteDisclosure = useDisclosure();

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
    const confirmDelete = () => {
        // delete quiz
        // delete all attempts
        if (!user) return;
        setIsDeleting(true);
        deleteQuiz(quiz.id, user.uid)
            .then(() => {
                toast({
                    ...SUCCESS_TOAST_OPTIONS,
                    title: "Quiz deleted!",
                });
            })
            .catch((e) => {
                setDeleteErrorMessage(e);
            })
            .finally(() => {
                setIsDeleting(false);
                alertDeleteDisclosure.onClose();
            });
    };

    const helperColor = useColorModeValue("gray.600", "gray.400");
    return (
        <Box
            flexGrow={1}
            maxWidth={!shouldNotBeFullWidth ? "full" : "400px"}
            mb={4}
        >
            <CustomAlertDialog
                {...alertDeleteDisclosure}
                bodyText={`Are you sure you want to delete this quiz? All attempts will be deleted. 
                
                This action is not reversible.`}
                headerText="Delete quiz"
                ConfirmButton={
                    <Button
                        onClick={confirmDelete}
                        isLoading={isDeleting}
                        colorScheme="red"
                    >
                        Delete
                    </Button>
                }
            />
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
                                {lastThreeSubmissions.map((submission, i) => (
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

                        <CardFooter w="full">
                            <Flex
                                justifyContent={"space-between"}
                                alignItems="center"
                                w="full"
                            >
                                <Text
                                    textColor={helperColor}
                                    fontWeight="bold"
                                    fontSize="sm"
                                    display="flex"
                                    alignItems={"center"}
                                >
                                    <Icon
                                        viewBox="0 0 200 200"
                                        color={
                                            quiz.quizSettings.academicYear ===
                                                ACADEMIC_YEAR &&
                                            quiz.quizSettings.semester ===
                                                ACADEMIC_SEMESTER
                                                ? "green.500"
                                                : "gray.500"
                                        }
                                        mr={1}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                                        />
                                    </Icon>
                                    {getAcademicYearAndSemester(
                                        quiz.quizSettings.academicYear,
                                        quiz.quizSettings.semester
                                    )}
                                </Text>
                                <Flex
                                    justifyContent={"end"}
                                    gap={2}
                                    flexGrow={1}
                                    alignItems="center"
                                >
                                    <IconButton
                                        icon={
                                            quiz.quizSettings.isPinned ? (
                                                <TbPinnedFilled />
                                            ) : (
                                                <TbPin />
                                            )
                                        }
                                        aria-label="Pin quiz"
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={pinQuiz}
                                    />

                                    <Divider
                                        orientation="vertical"
                                        height="28px"
                                    />
                                    <IconButton
                                        icon={<TbTrashX />}
                                        aria-label="Delete quiz"
                                        size="sm"
                                        variant="ghost"
                                        colorScheme={"red"}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alertDeleteDisclosure.onOpen();
                                        }}
                                    />
                                </Flex>
                            </Flex>
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
