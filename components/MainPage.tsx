"use client";
import {
    Box,
    Flex,
    Button,
    Text,
    Heading,
    Input,
    Stack,
} from "@chakra-ui/react";
import SignOutButton from "./SignOutButton";
import Courses from "./Module";
import { useAuthContainer } from "../app/providers";
import { signInWithGoogle } from "@/firebase/google";

const MainPage = () => {
    const authCtx = useAuthContainer();
    console.log(authCtx);

    const user = authCtx?.user;

    if (!user)
        return (
            <Stack px={4} justifyContent="center">
                {" "}
                <Heading>Sign in to get started with Canvaid. </Heading>{" "}
                <Button onClick={signInWithGoogle}>
                    {" "}
                    Sign in with Google{" "}
                </Button>
            </Stack>
        );

    return (
        <Stack px={4}>
            <Heading> Hello your home page </Heading>

            <Input placeholder="Search for a quiz" />

            {authCtx ? <Heading> HELLO USER</Heading> : <Text> :( </Text>}

            <Courses />
        </Stack>
    );
    //const { signOut } = useAuth(); // Replace with the sign-out function from firebase
    // const handleSignOut = () => {
    //   //call firebase sign out
    // };
    // return (
    //   <Button onClick = {handleSignOut}>Sign Out</Button>
    // )
};

export default MainPage;
