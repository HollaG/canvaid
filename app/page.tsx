"use client";
import Courses from "@/components/Courses";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/database/index";
import { AppUser } from "../types/user";
import User from "firebase/auth";
import { signInWithGoogle } from "@/firebase/auth/google";
import {
    Box,
    Button,
    ButtonGroup,
    Center,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
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
} from "@chakra-ui/react";
import NextLink from "next/link";

import {
    useAuthContainer,
    useQuizContainer,
    useSidebarContainer,
} from "./providers";
import NotAuthedHomePage from "@/components/PageWrappers/Home";
//import NotCanvasApiTokenPage from "@/app/token/page";
import NotCanvasApiTokenPage from "@/components/Home/NotCanvasApiTokenPage";
import {
    NAVBAR_HEIGHT,
    PAGE_CONTAINER_SIZE,
    SIDEBAR_WIDTH,
} from "@/lib/constants";
import { useEffect, useState } from "react";
import { Quiz } from "@/types/canvas";

import "./globals.css";
import { useRouter, useSearchParams } from "next/navigation";
import LoginComponent from "@/components/Auth/LoginComponent";
import Sidebar from "@/components/Sidebar/Sidebar";

import HomePageImage from "@/public/assets/homepage.svg";
import HomePageDarkImage from "@/public/assets/homepage-dark.svg";
import { SearchIcon } from "@chakra-ui/icons";
import useSidebar from "@/hooks/useSidebar";
import DrawerContainer from "@/components/Drawer/DrawerContainer";
import AddComponent from "@/components/Add/AddComponent";
import { getUploads } from "@/lib/functions";
import { TbSearch } from "react-icons/tb";
import ExamComponent from "@/components/Exam/ExamComponent";

export default function Page() {
    const authCtx = useAuthContainer();
    const { quizzes, setQuizzes, searchString, setSearchString } =
        useQuizContainer();
    const { isOpenSidebar } = useSidebarContainer();
    const user = authCtx?.user;

    // useEffect(() => {
    //     if (user) {
    //         getUploads(user.uid).then((data) => {
    //             setQuizzes(data.data || []);
    //         });
    //     }

    //     // if (user?.canvasApiToken) {
    //     //   setHasToken(true);
    //     // } else {
    //     //   setHasToken(false);
    //     // }
    // }, [user]);

    const handleDeleteItem = (itemId: string) => {
        const newState = quizzes.filter((item) => item.id !== itemId);
        setQuizzes(newState);
    };

    // get url query params
    const router = useRouter();
    const params = useSearchParams();
    const showLogIn = params && params.get("login") === "true";
    const updateToken = params && params.get("updateToken") === "true";

    // for login modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        // if showLogIn or updateToken, always show the login model if the user is not logged in or they don't have a canvasApiToken

        if (
            (updateToken && user) ||
            (showLogIn && (!user || !user.canvasApiToken))
        ) {
            console.log("updating");
            onOpen();
        } else {
            onClose();
            router.replace("/");
        }

        // cannot have router as dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLogIn, user, onClose, onOpen, updateToken]);

    const inputHoverColor = useColorModeValue("gray.50", "gray.700");
    const inputBackgroundColor = useColorModeValue("gray.100", "gray.800");
    // if (!user) return <NotAuthedHomePage />;
    // if (!user.canvasApiToken) return <NotCanvasApiTokenPage />;

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
                onClose={onCloseAddNewQuiz}
                isOpen={isOpenAddNewQuiz}
            >
                <AddComponent onClose={onCloseAddNewQuiz} />
            </DrawerContainer>
            <DrawerContainer onClose={onCloseExam} isOpen={isOpenExam}>
                <ExamComponent onClose={onCloseExam} />
            </DrawerContainer>
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
                                    <InputGroup size={"md"} maxWidth="750px">
                                        <InputLeftElement
                                            pointerEvents={"none"}
                                        >
                                            <TbSearch />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search for a quiz..."
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
                                                setSearchString(e.target.value)
                                            }
                                        />
                                    </InputGroup>
                                    <LightMode>
                                        <ButtonGroup isAttached ml={3}>
                                            <Button
                                                onClick={onOpenAddNewQuiz}
                                                data-testid="add-new-btn"
                                                borderRightWidth={"2px"}
                                                borderRightColor={
                                                    borderRightColor
                                                }
                                            >
                                                Upload
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    // router.push("/exam")
                                                    onOpenExam()
                                                }
                                                data-testid="exam-mode-btn"
                                            >
                                                Exam
                                            </Button>
                                        </ButtonGroup>
                                    </LightMode>
                                </Center>
                            </Box>
                        </Center>

                        {/* <Heading textAlign={"center"}>
                            Welcome back, {user.displayName}!
                        </Heading>
                        <Link
                            as={NextLink}
                            href="/add"
                            textAlign="center"
                            data-testid="add-new-btn"
                        >
                            Add a new quiz
                        </Link>
                        <Input placeholder="Search for a quiz..." /> */}
                        <Courses onAddNew={onOpenAddNewQuiz} />
                    </Stack>
                </Flex>
            )}
        </>
    );
}
