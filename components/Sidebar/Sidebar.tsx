"use client";
import { useAuthContainer } from "@/app/providers";
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
import Link from "next/link";
import { getUploads } from "@/lib/functions";
import { SIDEBAR_WIDTH, NAVBAR_HEIGHT } from "@/lib/constants";
import useSidebar from "@/hooks/useSidebar";

/**
 * Sidebar component.
 *
 * Displays the user's profile picture, name, and a list of links to navigate the app.
 *
 * Also displays the quizzes that the user has uploaded, sorted by course
 */
const Sidebar = () => {
    const { user } = useAuthContainer();
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

    if (!user) return null;
    return (
        <Box
            flexShrink={0}
            width={SIDEBAR_WIDTH}
            height="100%"
            position="fixed"
            top={NAVBAR_HEIGHT}
            left={0}
            bottom={0}
            display={{ base: "none", md: "block" }}
        >
            <Box p={6} height="full">
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
                <Accordion>
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
                                                <Link
                                                    href={`/uploads/${quiz.id}`}
                                                    className="sidebar-link"
                                                >
                                                    {quiz.quizName}
                                                </Link>
                                            </Button>
                                        ))}
                                    </Stack>
                                </AccordionPanel>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </Box>
        </Box>
    );
};

export default Sidebar;
