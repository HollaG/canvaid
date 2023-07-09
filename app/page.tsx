"use client";
import Courses from "@/components/Courses";
import SignOutButton from "@/components/DeleteButton";
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
import { Quiz } from "@/types/canvas";

import "./globals.css";
export default function Page() {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;

    const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);
    useEffect(() => {
        if (user?.uid) {
            fetch(`/api/?uid=${user.uid}`)
                .then((res) => res.json())
                .then((data) => {
                    //console.log(data.data);
                    setQuizzes(data.data || []);
                });
        }
    }, [user]);

    if (!user) return <NotAuthedHomePage />;
    const handleDeleteItem = (itemid: string) => {
        const newState = quizzes.filter((item) => item.id != itemid);
        setQuizzes(newState);
    };
    //console.log({ quizzes });
    return (
        <Container maxW={PAGE_CONTAINER_SIZE}>
            <Stack>
                <Heading textAlign={"center"}>
                    {" "}
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
                <Courses quizzes={quizzes} deletion={handleDeleteItem} />
            </Stack>
        </Container>
    );

    // return <MainPage />;
}
