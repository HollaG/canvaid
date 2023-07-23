import { IAddBody } from "@/app/api/add/route";
import { useAuthContainer } from "@/app/providers";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { QuizAttempt, Quiz } from "@/types/canvas";
import {
    Stack,
    Heading,
    Flex,
    useColorModeValue,
    Container,
    Text,
    Box,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    useBreakpointValue,
    useSteps,
    Collapse,
    Center,
    Divider,
    Button,
    AlertDialogOverlay,
    SimpleGrid,
    useMediaQuery,
    useToast,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { useState, FormEvent, useCallback } from "react";
import { useDropzone } from "react-dropzone";

type ResponseData = {
    quizAttempt: QuizAttempt;
    quiz: Quiz & {
        id: string;
    };
};

import AddImage from "@/public/assets/add.svg";
import AddDarkImage from "@/public/assets/add-dark.svg";
import Image from "next/image";
import { deleteAttempt } from "@/firebase/database/repositories/uploads";
import { ERROR_TOAST_OPTIONS } from "@/lib/toasts";

export default function AddComponent({ onClose }: { onClose: () => void }) {
    const [course, setCourse] = useState("");
    const [name, setName] = useState("");
    const toast = useToast();
    const authObj = useAuthContainer();
    const router = useRouter();
    const user = authObj?.user;

    // 0: not uploading
    // 1: uploading
    const [isUploading, setIsUploading] = useState(0);

    const [uploadedData, setUploadedData] = useState<ResponseData>();

    const [errorMessage, setErrorMessage] = useState("");

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Do something with the files
            if (!user) return;
            if (!user.canvasApiToken) return;
            if (acceptedFiles.length && acceptedFiles[0] instanceof File) {
                setIsUploading(1);
                const file = acceptedFiles[0];
                console.log(file.type, " -0--------------");
                if (file.type !== "text/html") {
                    setIsUploading(0);
                    setErrorMessage(
                        "Invalid file type! Please only upload HTML files."
                    );
                    console.log("invalid file type!!");
                    return;
                }
                file.text().then((txt: string) => {
                    const body: IAddBody = {
                        html: txt,
                        quizName: name,
                        course,
                        uid: user.uid,
                        canvasApiToken: user.canvasApiToken,
                    };

                    fetch("/api/add", {
                        method: "POST",
                        body: JSON.stringify(body),
                    })
                        .then((res) => {
                            if (!res.ok) {
                                return Promise.reject(res);
                            }

                            return res.json();
                        })
                        .then((data: ResponseData) => {
                            console.log("Received finished data");
                            setIsUploading(0);
                            // router.push(`/uploads/${data.quiz?.id}`);
                            setUploadedData(data);
                            setActiveStep(1);
                            setErrorMessage("");
                        })
                        .catch((e) => {
                            console.error(e.statusText);
                            setIsUploading(0);

                            setErrorMessage(e.statusText);
                        });
                });
            } else {
                setIsUploading(0);
                setErrorMessage(
                    "Invalid file type! Please only upload HTML files."
                );
            }
        },
        [course, name, router, user]
    );
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
            accept: {
                "text/html": [".html", ".htm"],
            },
        });

    const steps = [
        { title: "Upload", description: "Upload the HTML file of your quiz" },
        {
            title: "Review",
            description: "Review the quiz to ensure it's correct",
        },
    ];
    const stepperOrienation = useBreakpointValue({
        base: "vertical",
        md: "horizontal",
    });

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const [showIllustration] = useMediaQuery("(min-width: 1000px)");
    const isDarkMode = useColorModeValue(false, true);

    const [isUndoing, setIsUndoing] = useState(false);
    const undoUpload = async () => {
        setIsUndoing(true);
        try {
            // delete the quiz from the server
            if (!uploadedData || !user) return;
            const res = await deleteAttempt(
                uploadedData.quiz.id,
                user.uid,
                uploadedData.quizAttempt.submission.attempt
            );

            setActiveStep(0);
            setIsUploading(0);
        } catch (e: any) {
            toast({
                ...ERROR_TOAST_OPTIONS,
                title: "Error!",
                description: e.toString(),
            });
        } finally {
            setIsUndoing(false);
        }
    };

    const acceptUpload = () => {
        onClose();

        router.push(`/uploads/${uploadedData?.quiz?.id}`);
    };
    return (
        <>
            <Container maxWidth={PAGE_CONTAINER_SIZE}>
                {showIllustration && (
                    <Box position="fixed" bottom={0} right={-113} w="600px">
                        <Image
                            src={isDarkMode ? AddDarkImage : AddImage}
                            alt="Image asking for new upload"
                        />
                    </Box>
                )}
                <Container maxW="container.md" ml={0}>
                    <Box>
                        <Stepper
                            index={activeStep}
                            orientation={stepperOrienation as any}
                        >
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepIndicator>
                                        <StepStatus
                                            complete={<StepIcon />}
                                            incomplete={<StepNumber />}
                                            active={<StepNumber />}
                                        />
                                    </StepIndicator>

                                    <Box flexShrink="0">
                                        <StepTitle>{step.title}</StepTitle>
                                        <StepDescription>
                                            {step.description}
                                        </StepDescription>
                                    </Box>

                                    <StepSeparator />
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                    <Collapse
                        in={activeStep === 0}
                        unmountOnExit
                        data-testid="step-1"
                    >
                        <Flex mt={8} direction="column">
                            <Flex alignItems={"center"}>
                                <Heading fontWeight={"semibold"} fontSize="5xl">
                                    Let's upload a new quiz
                                </Heading>
                            </Flex>

                            <Flex
                                w="100%"
                                h="250px"
                                bgColor={useColorModeValue(
                                    "gray.100",
                                    "gray.700"
                                )}
                                justifyContent="center"
                                alignItems={"center"}
                                borderRadius="3xl"
                                mt={28}
                                border="2px dashed"
                                borderColor={useColorModeValue(
                                    "gray.400",
                                    "gray.600"
                                )}
                                zIndex={10000}
                            >
                                <div
                                    {...getRootProps()}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        textAlign: "center",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <input
                                        {...getInputProps()}
                                        data-testid="drop-input"
                                    />
                                    <Stack>
                                        <Center>
                                            <HTMLIcon />
                                        </Center>
                                        <Text>
                                            {isUploading === 0
                                                ? isDragActive
                                                    ? "Drop your file here!"
                                                    : "Drag and drop your HTML file here to start uploading."
                                                : "Your file is uploading, please wait..."}
                                        </Text>
                                        <Center>
                                            <Flex
                                                justifyContent={"space-between"}
                                                alignItems="center"
                                                w="100%"
                                                maxW={"250px"}
                                            >
                                                <Divider
                                                    borderColor={"gray.500"}
                                                    borderWidth="2px"
                                                />
                                                <Text
                                                    mx={3}
                                                    textColor={"gray.500"}
                                                >
                                                    {" "}
                                                    OR{" "}
                                                </Text>
                                                <Divider
                                                    borderColor={"gray.500"}
                                                    borderWidth="2px"
                                                />
                                            </Flex>
                                        </Center>

                                        <Center>
                                            <Button size="sm">
                                                Browse files
                                            </Button>
                                        </Center>
                                    </Stack>
                                </div>
                            </Flex>
                        </Flex>
                    </Collapse>
                    <Collapse
                        in={activeStep === 1}
                        unmountOnExit
                        data-testid="step-2"
                    >
                        <Flex mt={8} direction="column">
                            <Flex alignItems={"center"}>
                                <Heading fontWeight={"semibold"} fontSize="5xl">
                                    Do these look right?
                                </Heading>
                            </Flex>

                            <SimpleGrid
                                mt={16}
                                columns={{ base: 1, md: 2 }}
                                spacing={8}
                            >
                                <Box>
                                    <Text fontWeight={"bold"}>Course </Text>
                                    <Text> {uploadedData?.quiz.course}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight={"bold"}>Quiz Name</Text>
                                    <Text> {uploadedData?.quiz.quizName}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight={"bold"}>Score</Text>
                                    <Text>
                                        {" "}
                                        {Math.round(
                                            (uploadedData?.quizAttempt
                                                .submission.score || 0) * 100
                                        ) / 100}{" "}
                                        /{" "}
                                        {Math.round(
                                            (uploadedData?.quizAttempt
                                                .submission
                                                .quiz_points_possible || 0) *
                                                100
                                        ) / 100}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight={"bold"}>
                                        Attempt Number
                                    </Text>
                                    <Text>
                                        {" "}
                                        {
                                            uploadedData?.quizAttempt.submission
                                                .attempt
                                        }
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight={"bold"}>
                                        Quiz Completion Time
                                    </Text>
                                    <Text>
                                        {" "}
                                        {new Date(
                                            uploadedData?.quizAttempt.submission
                                                .finished_at || ""
                                        ).toString()}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight={"bold"}>
                                        Number of Questions
                                    </Text>
                                    <Text>
                                        {" "}
                                        {
                                            Object.keys(
                                                uploadedData?.quizAttempt
                                                    .selectedOptions || {}
                                            ).length
                                        }
                                    </Text>
                                </Box>
                            </SimpleGrid>
                            <Flex mt={6}>
                                <Button
                                    colorScheme={"gray"}
                                    mr={4}
                                    mb={3}
                                    onClick={undoUpload}
                                    isLoading={isUndoing}
                                    data-testid="undo-btn"
                                >
                                    Go back
                                </Button>
                                <Button
                                    onClick={acceptUpload}
                                    data-testid="accept-btn"
                                >
                                    Add quiz
                                </Button>
                            </Flex>
                        </Flex>
                    </Collapse>
                    {errorMessage && (
                        <Alert status="error" mt={6} data-testid="alert-error">
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Error uploading file!</AlertTitle>
                                <AlertDescription>
                                    {errorMessage}
                                </AlertDescription>
                            </Box>
                        </Alert>
                    )}
                </Container>
            </Container>
        </>
    );
}

const HTMLIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        style={{ fill: "#319795" }}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8.531 18h-.76v-1.411H6.515V18h-.767v-3.373h.767v1.296h1.257v-1.296h.76V18zm3-2.732h-.921V18h-.766v-2.732h-.905v-.641h2.592v.641zM14.818 18l-.05-1.291c-.017-.405-.03-.896-.03-1.387h-.016c-.104.431-.245.911-.375 1.307l-.41 1.316h-.597l-.359-1.307a15.154 15.154 0 0 1-.306-1.316h-.011c-.021.456-.034.976-.059 1.396L12.545 18h-.705l.216-3.373h1.015l.331 1.126c.104.391.21.811.284 1.206h.017c.095-.391.209-.836.32-1.211l.359-1.121h.996L15.563 18h-.745zm3.434 0h-2.108v-3.373h.767v2.732h1.342V18z"></path>
    </svg>
);
