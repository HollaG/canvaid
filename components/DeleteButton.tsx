"use client";
import { Button, Flex, Text, IconButton } from "@chakra-ui/react";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/database/index";
import { Quiz, QuizSubmissionQuestion } from "../types/canvas";
import { Dispatch, SetStateAction } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { TbTrashX } from "react-icons/tb";
import { deleteQuizQuestionAnnotation } from "@/firebase/database/repositories/uploads";
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || "uploads";

type DeleteButtonProps = {
    ID: string;
    onDelete: () => void;
};

/**
 * @deprecated Use deleteQuiz instead
 * @param param0
 * @returns
 */
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

    return <TbTrashX fontSize={"24px"} onClick={() => handleDelete()} />;
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
    setQuiz: (quiz: Quiz & { id: string }) => void;
}) {
    const handleDelete = async () => {
        try {
            const updatedQuiz = await deleteQuizQuestionAnnotation(
                ID,
                annotationID,
                question
            );
            setQuiz(updatedQuiz);
            return updatedQuiz;
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <IconButton
            aria-label={"Delete annotation"}
            icon={<TbTrashX />}
            size="sm"
            onClick={() => handleDelete()}
            colorScheme="red"
            variant="ghost"
        />
    );
}
