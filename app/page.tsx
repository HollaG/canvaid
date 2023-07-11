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
    Heading,
    Input,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

import { useAuthContainer } from "./providers";
import NotAuthedHomePage from "@/components/PageWrappers/Home";
//import NotCanvasApiTokenPage from "@/app/token/page";
import NotCanvasApiTokenPage from "@/components/Home/NotCanvasApiTokenPage";
import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Quiz } from "@/types/canvas";

import "./globals.css";
import { useRouter, useSearchParams } from "next/navigation";
import LoginComponent from "@/components/Auth/LoginComponent";
export default function Page() {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;

    const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);
    //const [hasToken, setHasToken] = useState(false);
    useEffect(() => {
        if (user?.uid) {
            fetch(`/api/?uid=${user.uid}`)
                .then((res) => res.json())
                .then((data) => {
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
    }, [showLogIn, user, user?.canvasApiToken]);
    console.log(showLogIn);
    // for login modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    // if (!user) return <NotAuthedHomePage />;
    // if (!user.canvasApiToken) return <NotCanvasApiTokenPage />;

    return (
        <>
            <Drawer
                onClose={() => {
                    router.push("/");
                }}
                isOpen={isOpen}
                size={"full"}
            >
                <DrawerOverlay />
                <DrawerContent mt={NAVBAR_HEIGHT}>
                    <DrawerCloseButton />
                    <DrawerHeader
                        fontWeight={"normal"}
                        bgColor={useColorModeValue("gray.100", "gray.900")}
                    >
                        <Container maxWidth={PAGE_CONTAINER_SIZE}>
                            Login (Step 1 of 2){" "}
                        </Container>
                    </DrawerHeader>
                    <DrawerBody
                        bgColor={useColorModeValue("gray.100", "gray.900")}
                    >
                        <LoginComponent />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
            {(!user || !user.canvasApiToken) && <NotAuthedHomePage />}
            {user && user.canvasApiToken && (
                <Container
                    maxW={PAGE_CONTAINER_SIZE}
                    minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
                    mt={NAVBAR_HEIGHT}
                >
                    <Stack>
                        <Heading textAlign={"center"}>
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
                        <Input placeholder="Search for a quiz..." />
                        <Courses
                            quizzes={quizzes}
                            deletion={handleDeleteItem}
                        />
                    </Stack>
                </Container>
            )}
        </>
    );
}
