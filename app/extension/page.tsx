"use client";

import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "@/lib/constants";
import {
    Button,
    Flex,
    Heading,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { useAuthContainer, useSidebarContainer } from "../providers";
import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { randomUUID } from "crypto";
import { updateUserExtensionToken } from "@/firebase/database/repositories/users";
/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const { user } = useAuthContainer();
    const { isOpenSidebar, setIsOpenSidebar } = useSidebarContainer();
    const bgColor = useColorModeValue("gray.50", "gray.900");

    const [token, setToken] = useState("");

    const regenerate = () => {
        if (!user) return;
        const randomString =
            new Date().getTime().toString(36) +
            Math.random().toString(36).slice(2);
        // set the token in the database
        console.log(randomString, user.uid);
        setToken(randomString);
        updateUserExtensionToken(user.uid, randomString).catch(console.log);
    };
    useEffect(() => {
        // fetch the token from the database
        if (user && !user.extensionToken) {
            // if the user doesn't have a token, generate one
            regenerate();
        }

        if (user && user.extensionToken) {
            setToken(user.extensionToken);
        }
    }, [user]);

    if (!user)
        return (
            <Flex
                minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
                // mt={NAVBAR_HEIGHT}
                px={{ base: 0, md: 6 }}
            >
                <Stack
                    spacing={6}
                    flexGrow={1}
                    ml={
                        user
                            ? isOpenSidebar
                                ? { base: 0, md: SIDEBAR_WIDTH }
                                : { base: 0, md: "60px" }
                            : 0
                    }
                    p={4}
                    bgColor={bgColor}
                    borderRadius={{ base: 0, md: "xl" }}
                    mt={{ base: 0, md: 6 }}
                >
                    <Heading>Canvaid Extension</Heading>
                    <Text> Blah blah</Text>
                </Stack>
            </Flex>
        );
    return (
        <Flex
            minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
            // mt={NAVBAR_HEIGHT}
            px={{ base: 0, md: 6 }}
        >
            <Stack
                spacing={6}
                flexGrow={1}
                ml={
                    user
                        ? isOpenSidebar
                            ? { base: 0, md: SIDEBAR_WIDTH }
                            : { base: 0, md: "60px" }
                        : 0
                }
                p={4}
                bgColor={bgColor}
                borderRadius={{ base: 0, md: "xl" }}
                mt={{ base: 0, md: 6 }}
            >
                <Heading>Canvaid Extension</Heading>
                <Text> Get unique code </Text>
                <Text> {token} </Text>
                <Button onClick={regenerate}> Regenerate </Button>
            </Stack>
        </Flex>
    );
}
