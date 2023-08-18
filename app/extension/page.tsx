"use client";

import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "@/lib/constants";
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Stack,
    Text,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { useAuthContainer, useSidebarContainer } from "../providers";
import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { randomUUID } from "crypto";
import { updateUserExtensionToken } from "@/firebase/database/repositories/users";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import Image from "next/image";
import ExtensionImage from "@/public/logos/extensionLogo.png";
import { CheckIcon } from "@chakra-ui/icons";
import { TbCopy } from "react-icons/tb";
/**
 *
 * @returns The page for each user's quiz that they uploaded.
 */
export default function Page() {
    const { user } = useAuthContainer();
    const { isOpenSidebar, setIsOpenSidebar } = useSidebarContainer();
    const bgColor = useColorModeValue("gray.50", "gray.900");

    const [extensionToken, setExtensionToken] = useState("");

    const toast = useToast();
    const [isRegenerating, setIsRegenerating] = useState(false);
    const regenerate = () => {
        if (!user) return;
        setIsRegenerating(true);
        const randomString =
            new Date().getTime().toString(36) +
            Math.random().toString(36).slice(2);
        // set the token in the database
        console.log(randomString, user.uid);
        setExtensionToken(randomString);
        updateUserExtensionToken(user.uid, randomString)
            .then(() => {
                copyToClipboard();
                setIsRegenerating(false);
            })
            .catch(console.log)
            .finally(() => {
                setIsRegenerating(false);
            });
    };
    useEffect(() => {
        // fetch the token from the database
        if (user && !user.extensionToken) {
            // if the user doesn't have a token, generate one
            regenerate();
        }

        if (user && user.extensionToken) {
            setExtensionToken(user.extensionToken);
        }
    }, [user]);

    const fullToken = `${extensionToken}::${
        user && user.canvasApiToken ? user.canvasApiToken : ""
    }`;

    const [hasCopied, setHasCopied] = useState(0);
    const copyToClipboard = () => {
        setHasCopied(1);

        navigator.clipboard
            .writeText(fullToken)
            .then(() => {
                toast({
                    title: "Copied to clipboard",
                    ...SUCCESS_TOAST_OPTIONS,
                });
                setHasCopied(2);
                setTimeout(() => {
                    setHasCopied(0);
                }, 3000);
            })
            .catch((e) => {
                toast({
                    title: "Failed to copy to clipboard",
                    description: e.message,
                    ...ERROR_TOAST_OPTIONS,
                });
                setHasCopied(0);
            });
    };
    const backgroundImage = useColorModeValue(
        "url(/assets/background.svg)",
        "url(/assets/background-dark.svg)"
    );
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
            justifyContent={"center"}
            bgColor={bgColor}
            backgroundImage={backgroundImage}
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
                borderRadius={{ base: 0, md: "xl" }}
                mt={{ base: 0, md: 6 }}
                maxW={"container.md"}
            >
                <Center>
                    <Box maxW={"450px"}>
                        <Image
                            src={ExtensionImage}
                            alt="Image representing exam mode"
                            style={{ objectFit: "cover" }}
                        />
                    </Box>
                </Center>
                <Heading textAlign={"center"}>Canvaid Extension</Heading>
                <Text textAlign={"center"} fontSize={"xl"}>
                    {" "}
                    Copy your unique code for the Extension here!{" "}
                </Text>
                {/* <Text>
                    {" "}
                    {user.canvasApiToken}::{extensionToken}{" "}
                </Text> */}
                <InputGroup>
                    <InputLeftElement
                        pointerEvents="none"
                        color="gray.300"
                        fontSize="1.2em"
                    >
                        <TbCopy />
                    </InputLeftElement>
                    <Input
                        placeholder="Your Unique Token"
                        readOnly
                        value={fullToken}
                    />
                    <InputRightElement w="60px">
                        <Button
                            size="xs"
                            px={5}
                            mr={2}
                            onClick={copyToClipboard}
                            isLoading={hasCopied === 1}
                            colorScheme={hasCopied === 2 ? "green" : "gray"}
                        >
                            {hasCopied === 0 ? "Copy" : "Copied!"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <Flex justifyContent={"center"}>
                    <Button
                        onClick={regenerate}
                        colorScheme="orange"
                        isLoading={isRegenerating}
                    >
                        {" "}
                        Regenerate{" "}
                    </Button>
                </Flex>
            </Stack>{" "}
        </Flex>
    );
}
