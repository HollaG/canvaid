"use client";
import Courses from "@/components/Courses";
import SignOutButton from "@/components/SignOutButton";
import { signInWithGoogle } from "@/firebase/auth/google";
import {
    Box,
    Button,
    Center,
    Container,
    Heading,
    Input,
    Stack,
    Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

import { useAuthContainer } from "./providers";
import NotAuthedHomePage from "@/components/PageWrappers/Home";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { QuizAttempt } from "@/types/canvas";

export default function Page() {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;

    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
    useEffect(() => {
        if (user?.uid) {
            fetch(`/api/?uid=${user.uid}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log(data.data);
                    setQuizAttempts(data.data || []);
                });
        }
    }, [user]);

    if (!user) return <NotAuthedHomePage />;

    console.log(user);
    return (
        <Container maxW={PAGE_CONTAINER_SIZE}>
            <Stack>
                <Heading textAlign={"center"}>
                    {" "}
                    Welcome back, {user.displayName}!
                </Heading>

                <Link as={NextLink} href="/add" textAlign="center">
                    Add a new quiz
                </Link>
                <Input placeholder="Search for a quiz..." />
                <Courses multipleQuizAttempts={quizAttempts} />
            </Stack>
        </Container>
    );

    // return <MainPage />;
}
