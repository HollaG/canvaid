"use client";
import { Button, Flex, Text, IconButton } from "@chakra-ui/react";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { BsTrash } from "react-icons/bs";
import { db } from "../firebase/database/index";
import { Quiz, QuizSubmissionQuestion } from "../types/canvas";
import { Dispatch, SetStateAction } from "react";
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || "uploads";

type DeleteButtonProps = {
  ID: string;
  onDelete: () => void;
};
function DeleteButton({ ID, onDelete }: DeleteButtonProps) {
  const handleDelete = async () => {
    try {
      console.log("Attempting delete of ", ID);
      const docRef = doc(db, COLLECTION_NAME, ID);
      await deleteDoc(docRef);
      onDelete();
    } catch (error) {
      console.log(error);
    }
  };

  return <BsTrash fontSize={"24px"} onClick={() => handleDelete()} />;
}
export default DeleteButton;

export function DeleteAnnotationButton({
  ID,
  annotationID,
  setQuiz,
  question,
}: {
  ID: string;
  annotationID: number;
  question: QuizSubmissionQuestion;
  setQuiz: Dispatch<
    SetStateAction<
      | (Quiz & {
          id: string;
        })
      | undefined
    >
  >;
}) {
  const handleDelete = async () => {
    try {
      console.log("Attempting delete of ");
      const existingQuiz = doc(db, COLLECTION_NAME, ID);
      const existingQuizData = (await getDoc(existingQuiz)).data() as Quiz;
      const existingQuestions = existingQuizData.questions;
      const newQuestions = existingQuestions.map((qn) => {
        if (qn.id === question.id) {
          qn.annotations = qn.annotations.filter(
            (ann) => ann.annotationID !== annotationID
          );
        }
        return qn;
      });
      existingQuizData.questions = newQuestions;
      await updateDoc(existingQuiz, existingQuizData);
      const updatedQuiz = {
        ...existingQuizData,
        id: ID,
      };
      setQuiz(updatedQuiz);
      return updatedQuiz;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <IconButton
      aria-label="delete"
      icon={<BsTrash />}
      size="sm"
      onClick={() => handleDelete()}
    />
  );
}
