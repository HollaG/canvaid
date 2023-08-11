"use client";
import Courses from "@/components/Courses";
import {
    Box,
    Button,
    ButtonGroup,
    Center,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    LightMode,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
    useMediaQuery,
} from "@chakra-ui/react";
import NextLink from "next/link";

import {
    useAuthContainer,
    useQuizContainer,
    useSidebarContainer,
} from "./providers";
import NotAuthedHomePage from "@/components/PageWrappers/Home";
//import NotCanvasApiTokenPage from "@/app/token/page";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "@/lib/constants";
import { useEffect, useState } from "react";

import "./globals.css";
import { useRouter, useSearchParams } from "next/navigation";
import LoginComponent from "@/components/Auth/LoginComponent";
import DrawerContainer from "@/components/Drawer/DrawerContainer";
import AddComponent from "@/components/Add/AddComponent";
import { TbSearch } from "react-icons/tb";
import ExamComponent from "@/components/Exam/ExamComponent";
import ResetComponent from "@/components/Auth/ResetComponent";

export default function Page() {
    const authCtx = useAuthContainer();
    const { quizzes, setQuizzes, searchString, setSearchString } =
        useQuizContainer();
    const { isOpenSidebar } = useSidebarContainer();
    const user = authCtx?.user;
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
    // get url query params
    const router = useRouter();
    const params = useSearchParams();
    const showLogIn = params && params.get("login") === "true";
    const updateToken = params && params.get("updateToken") === "true";
    const isResetting = params && params.get("reset") === "true";

    // for login modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        // if showLogIn or updateToken, always show the login model if the user is not logged in or they don't have a canvasApiToken

        if (
            (updateToken && user) ||
            (showLogIn && (!user || !user.canvasApiToken))
        ) {
            onOpen();
        } else if (isResetting) {
            onOpenChangePassword();
        } else {
            onClose();
            onCloseChangePassword();
            router.replace("/");
        }

        // cannot have router as dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLogIn, user, onClose, onOpen, updateToken]);

    const inputHoverColor = useColorModeValue("gray.50", "gray.700");
    const inputBackgroundColor = useColorModeValue("gray.100", "gray.800");

    // For add new quiz
    const {
        isOpen: isOpenAddNewQuiz,
        onOpen: onOpenAddNewQuiz,
        onClose: onCloseAddNewQuiz,
    } = useDisclosure();

    const borderRightColor = useColorModeValue("teal.700", "teal.700");

    // for go exam mode
    const {
        isOpen: isOpenExam,
        onOpen: onOpenExam,
        onClose: onCloseExam,
    } = useDisclosure();

    // for change password
    const {
        isOpen: isOpenChangePassword,
        onOpen: onOpenChangePassword,
        onClose: onCloseChangePassword,
    } = useDisclosure();

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const bgImage = useColorModeValue(
        "url(/assets/background.svg)",
        "url(/assets/background-dark.svg)"
    );
    const bgColorHeader = useColorModeValue("teal.700", "teal.900");
    const backgroundImage = useColorModeValue(
        "url(/assets/background.svg)",
        "url(/assets/background-dark.svg)"
    );
    return (
        <>
            <DrawerContainer
                onClose={() => {
                    router.push("/");
                }}
                isOpen={isOpen}
                showNavbar
            >
                <LoginComponent />
            </DrawerContainer>
            <DrawerContainer
                onClose={onCloseChangePassword}
                isOpen={isOpenChangePassword}
                showNavbar
            >
                <ResetComponent />
            </DrawerContainer>
            <DrawerContainer
                onClose={onCloseAddNewQuiz}
                isOpen={isOpenAddNewQuiz}
            >
                <AddComponent onClose={onCloseAddNewQuiz} />
            </DrawerContainer>
            <DrawerContainer onClose={onCloseExam} isOpen={isOpenExam}>
                <ExamComponent onClose={onCloseExam} />
            </DrawerContainer>
            {/* Goes to NotAuthedHome page if no user or no token WHICH will add ?login=true to the url WHICH will cause the useEFFECT to change as its
            dependencies are the params WHICH will open the corresponding DRAWER CONTAINER WHICH contains the component*/}
            {(!user || !user.canvasApiToken) && <NotAuthedHomePage />}
            {user && user.canvasApiToken && (
                <Flex
                    minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
                    px={{ base: 0, md: 6 }}
                >
                    <Stack
                        flexGrow={1}
                        mt={{ base: 0, md: 6 }}
                        ml={
                            isOpenSidebar
                                ? { base: 0, md: SIDEBAR_WIDTH }
                                : { base: 0, md: "30px" }
                        }
                        pt={6}
                        bgColor={bgColor}
                        backgroundImage={bgImage}
                        backgroundSize={"200%"}
                        borderRadius={{ base: 0, md: "xl" }}
                    >
                        <Center px={12}>
                            <Box
                                width="100%"
                                bgColor={bgColorHeader}
                                borderRadius={"xl"}
                                backgroundImage={backgroundImage}
                                // backgroundAttachment="fixed"
                                backgroundSize={"10%"}
                                py={{ base: 2, sm: 4, md: 6, lg: 12 }}
                            >
                                <Heading
                                    textAlign={"center"}
                                    fontSize="2xl"
                                    textColor={"white"}
                                >
                                    {" "}
                                    What will you study today?{" "}
                                </Heading>
                                <Center px={6} mt={6}>
                                    {isLargerThan768 ? (
                                        <InputGroup
                                            maxWidth="750px"
                                            //size={{ base: "sm", md: "lg" }}
                                            size={"lg"}
                                        >
                                            <InputLeftElement
                                                pointerEvents={"none"}
                                            >
                                                <TbSearch />
                                            </InputLeftElement>
                                            <Input
                                                placeholder="Search for a quiz"
                                                variant="filled"
                                                _hover={{
                                                    bgColor: inputHoverColor,
                                                }}
                                                _focusVisible={{
                                                    bgColor: inputHoverColor,
                                                }}
                                                type="search"
                                                bgColor={inputBackgroundColor}
                                                value={searchString}
                                                onChange={(e) =>
                                                    setSearchString(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </InputGroup>
                                    ) : (
                                        <InputGroup
                                            maxWidth="750px"
                                            size={"sm"}
                                        >
                                            <InputLeftElement
                                                pointerEvents={"none"}
                                            >
                                                <TbSearch />
                                            </InputLeftElement>
                                            <Input
                                                placeholder="Search"
                                                variant="filled"
                                                _hover={{
                                                    bgColor: inputHoverColor,
                                                }}
                                                _focusVisible={{
                                                    bgColor: inputHoverColor,
                                                }}
                                                type="search"
                                                bgColor={inputBackgroundColor}
                                                value={searchString}
                                                onChange={(e) =>
                                                    setSearchString(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </InputGroup>
                                    )}

                                    <LightMode>
                                        <ButtonGroup isAttached ml={3}>
                                            <Button
                                                onClick={onOpenAddNewQuiz}
                                                data-testid="add-new-btn"
                                                borderRightWidth={"2px"}
                                                borderRightColor={
                                                    borderRightColor
                                                }
                                                size={{ base: "sm", md: "lg" }}
                                            >
                                                Upload
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    // router.push("/exam")
                                                    onOpenExam()
                                                }
                                                data-testid="exam-mode-btn"
                                                size={{ base: "sm", md: "lg" }}
                                            >
                                                Exam
                                            </Button>
                                        </ButtonGroup>
                                    </LightMode>
                                </Center>
                            </Box>
                        </Center>
                        <Courses onAddNew={onOpenAddNewQuiz} />
                    </Stack>
                </Flex>
            )}
        </>
    );
}
