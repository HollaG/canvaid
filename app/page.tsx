"use client";
import Course from "@/components/Module";
import SignOutButton from "@/components/SignOutButton";
import { signInWithGoogle } from "@/firebase/google";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

import { useAuthContainer } from "./providers";
export default function Page() {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;
    if (!user)
        return (
            <Stack justifyContent="center">
                {" "}
                <Heading>Sign in to get started with Canvaid. </Heading>{" "}
                <Button onClick={signInWithGoogle}>
                    {" "}
                    Sign in with Google{" "}
                </Button>
            </Stack>
        );

    return (
        <Box>
            <Heading> HELLO HELLO welcome back to cs2040s </Heading>

            <Link as={NextLink} href="/add">
                Add a new quiz
            </Link>
            <Course />
        </Box>
    );

    // return <MainPage />;
}
