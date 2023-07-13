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
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import NextLink from "next/link";

import { useAuthContainer } from "./providers";
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

export default function Page() {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;

    const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);

    useEffect(() => {
        if (user) {
            getUploads(user.uid).then((data) => {
                setQuizzes(data.data || []);
            });
        }

        // if (user?.canvasApiToken) {
        //   setHasToken(true);
        // } else {
        //   setHasToken(false);
        // }
    }, [user]);

    const handleDeleteItem = (itemId: string) => {
        const newState = quizzes.filter((item) => item.id !== itemId);
        setQuizzes(newState);
    };

    // get url query params
    const router = useRouter();
    const params = useSearchParams();
    const showLogIn = params.get("login") === "true";
    useEffect(() => {
        // if showLogIn, always show the login model if the user is not logged in or they don't have a canvasApiToken
        console.log("useeffect");
        console.log({ showLogIn, user });
        if (showLogIn && (!user || !user.canvasApiToken)) {
            console.log("onopen");
            onOpen();
        } else {
            console.log("Closing modal!");
            onClose();
        }
    }, [showLogIn, user]);

    // for login modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    const inputHoverColor = useColorModeValue("gray.50", "gray.700");
    const inputBackgroundColor = useColorModeValue("gray.100", "gray.800");
    // if (!user) return <NotAuthedHomePage />;
    // if (!user.canvasApiToken) return <NotCanvasApiTokenPage />;

    const showSidebar = useSidebar();

    // For add new quiz
    const {
        isOpen: isOpenAddNewQuiz,
        onOpen: onOpenAddNewQuiz,
        onClose: onCloseAddNewQuiz,
    } = useDisclosure();

    return (
        <>
            <DrawerContainer
                onClose={() => {
                    router.push("/");
                }}
                isOpen={isOpen}
            >
                <LoginComponent />
            </DrawerContainer>
            <DrawerContainer
                onClose={onCloseAddNewQuiz}
                isOpen={isOpenAddNewQuiz}
            >
                <AddComponent onClose={onCloseAddNewQuiz} />
            </DrawerContainer>

            {(!user || !user.canvasApiToken) && <NotAuthedHomePage />}
            {user && user.canvasApiToken && (
                <Flex
                    minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
                    mt={NAVBAR_HEIGHT}
                >
                    <Stack
                        flexGrow={1}
                        mt={6}
                        ml={showSidebar ? SIDEBAR_WIDTH : 0}
                        pt={6}
                        bgColor={useColorModeValue("gray.50", "gray.900")}
                        backgroundImage={useColorModeValue(
                            "url(/assets/background.svg)",
                            "url(/assets/background-dark.svg)"
                        )}
                        backgroundSize={"200%"}
                        borderRadius="xl"
                    >
                        <Center px={12}>
                            <Box
                                width="100%"
                                bgColor={useColorModeValue(
                                    "teal.700",
                                    "teal.900"
                                )}
                                borderRadius={"xl"}
                                backgroundImage={useColorModeValue(
                                    "url(/assets/background.svg)",
                                    "url(/assets/background-dark.svg)"
                                )}
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
                                    <InputGroup size={"lg"} maxWidth="750px">
                                        <InputLeftElement
                                            pointerEvents={"none"}
                                        >
                                            <SearchIcon />
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
                                        />
                                    </InputGroup>

                                    <Button
                                        size="lg"
                                        ml={3}
                                        onClick={onOpenAddNewQuiz}
                                    >
                                        Upload
                                    </Button>
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
                        <Courses
                            quizzes={quizzes}
                            deletion={handleDeleteItem}
                        />
                    </Stack>
                </Flex>
            )}
        </>
    );
}
