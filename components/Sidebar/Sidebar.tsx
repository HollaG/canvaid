"use client";
import { useAuthContainer, useQuizContainer } from "@/app/providers";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Box,
    BoxProps,
    Button,
    Center,
    CloseButton,
    Divider,
    Drawer,
    DrawerContent,
    Flex,
    FlexProps,
    Heading,
    Icon,
    IconButton,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
    Link,
    useColorMode,
} from "@chakra-ui/react";

import React, { ReactNode, useEffect, useState } from "react";

import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
    FiSettings,
    FiMenu,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { Quiz } from "@/types/canvas";
import NextLink from "next/link";
import { getUploads } from "@/lib/functions";
import { SIDEBAR_WIDTH, NAVBAR_HEIGHT, FOOTER_HEIGHT } from "@/lib/constants";
import useSidebar from "@/hooks/useSidebar";

import MainLogo from "@/public/logos/main.png";
import Image from "next/image";

import { TbDoorExit } from "react-icons/tb";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { signOutAll } from "@/firebase/auth";
import Navbar from "../Navbar/Navbar";
/**
 * Sidebar component.
 *
 * Displays the user's profile picture, name, and a list of links to navigate the app.
 *
 * Also displays the quizzes that the user has uploaded, sorted by course
 */
const Sidebar = () => {
    const { user } = useAuthContainer();
    // const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);

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
    const { quizzes } = useQuizContainer();

    // group the quiz by course name
    const quizzesByCourse = quizzes.reduce(
        (acc, quiz) => {
            if (!acc[quiz.course.split(" ")[0].toUpperCase()]) {
                acc[quiz.course.split(" ")[0].toUpperCase()] = [];
            }
            acc[quiz.course.split(" ")[0].toUpperCase()].push(quiz);
            return acc;
        },
        {} as Record<
            string,
            (Quiz & {
                id: string;
            })[]
        >
    );

    console.log({ quizzesByCourse });

    const { colorMode, toggleColorMode } = useColorMode();

    if (!user) return null;
    const sidebarColor = useColorModeValue("white", "gray.900");
    return (
        <>
            <Box display={{ base: "block", md: "none" }} height={NAVBAR_HEIGHT}>
                <Navbar />
            </Box>
            <Box
                flexShrink={0}
                width={SIDEBAR_WIDTH}
                height="100%"
                position="fixed"
                top={0}
                left={0}
                // bottom={FOOTER_HEIGHT}
                display={{ base: "none", md: "block" }}
                bgColor={sidebarColor}
            >
                <Flex p={6} pr={0} height="full" flexDir={"column"}>
                    <Flex alignItems="center" mb={6}>
                        <Link as={NextLink} href="/">
                            <Image
                                src={MainLogo}
                                height="34"
                                alt="Website logo"
                            />
                        </Link>
                    </Flex>
                    <Center>
                        <Avatar
                            size="2xl"
                            src={user?.photoURL}
                            name={user?.displayName}
                        />
                    </Center>
                    <Text mt={3} textAlign="center">
                        {" "}
                        Welcome back,{" "}
                    </Text>
                    <Heading fontSize="xl" textAlign={"center"}>
                        {user?.displayName}!
                    </Heading>
                    <Divider my={6} />
                    <Text
                        textColor={"gray.600"}
                        fontWeight="bold"
                        fontSize="sm"
                        mb={3}
                    >
                        Quick Access
                    </Text>
                    <Accordion flexGrow={1} overflowY="auto">
                        {Object.keys(quizzesByCourse).map((courseCode) => {
                            const quizzes = quizzesByCourse[courseCode];
                            return (
                                <AccordionItem key={courseCode} border={0}>
                                    <h2>
                                        <AccordionButton>
                                            <Box
                                                as="span"
                                                flex="1"
                                                textAlign="left"
                                            >
                                                {courseCode}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4} px={1}>
                                        <Stack>
                                            {quizzes.map((quiz, i) => (
                                                <Button
                                                    size="sm"
                                                    colorScheme={"gray"}
                                                    variant="ghost"
                                                    textAlign={"left"}
                                                    justifyContent="left"
                                                    pl={2}
                                                    textDecor="none"
                                                    key={i}
                                                >
                                                    <NextLink
                                                        href={`/uploads/${quiz.id}`}
                                                        className="sidebar-link"
                                                    >
                                                        {quiz.quizName}
                                                    </NextLink>
                                                </Button>
                                            ))}
                                        </Stack>
                                    </AccordionPanel>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                    <Flex alignItems={"center"} justifyContent="space-between">
                        <Button
                            onClick={toggleColorMode}
                            variant="ghost"
                            colorScheme="gray"
                        >
                            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                        </Button>
                        <Button
                            variant={"ghost"}
                            colorScheme="gray"
                            onClick={signOutAll}
                        >
                            <TbDoorExit />
                        </Button>
                    </Flex>
                    {/* <Flex textAlign="right">
                    <Text
                        textColor={"gray.600"}
                        fontWeight="bold"
                        fontSize="sm"
                        mt={3}
                        w="full"
                    >
                        About us
                    </Text>
                </Flex> */}
                </Flex>
            </Box>
        </>
    );
};

export default Sidebar;
