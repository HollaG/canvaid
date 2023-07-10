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
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

import { useAuthContainer } from "./providers";
import NotAuthedHomePage from "@/components/PageWrappers/Home";
//import NotCanvasApiTokenPage from "@/app/token/page";
import NotCanvasApiTokenPage from "@/components/Home/NotCanvasApiTokenPage";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Quiz } from "@/types/canvas";

import "./globals.css";
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

  if (!user) return <NotAuthedHomePage />;
  console.log("canvasapi:" + user.canvasApiToken);
  if (!user.canvasApiToken) return <NotCanvasApiTokenPage />;


  const handleDeleteItem = (itemId: string) => {
    const newState = quizzes.filter((item) => item.id !== itemId);
    setQuizzes(newState);
  };

  return (
    <Container maxW={PAGE_CONTAINER_SIZE}>
      <Stack>
        <Heading textAlign={"center"}>
          Welcome back, {user.displayName}!
        </Heading>
        <Link as={NextLink} href="/add" textAlign="center" data-testid="add-new-btn">
          Add a new quiz
        </Link>
        <Input placeholder="Search for a quiz..." />
        <Courses quizzes={quizzes} deletion={handleDeleteItem} />
      </Stack>
    </Container>
  );
}
