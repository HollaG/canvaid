"use client";
import {
    Button,
    Box,
    Heading,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export const Timer = ({
    startTimeInMinutes,
}: {
    startTimeInMinutes: number;
}) => {
    const [time, setTime] = useState(startTimeInMinutes);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();

    useEffect(() => {
        let interval = setInterval(() => {
            setTime((prev) => prev - 1);
        }, 1000);

        return () => {
            clearInterval(interval); // Clear the interval when the component unmounts
        };
    }, []);
    useEffect(() => {
        if (time <= 0) {
            onOpen(); // Automatically open the modal when the time's up
            setTime(0); // Reset the timer to 0 when it reaches 0
        }
    }, [time, onOpen]);
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    const handleClose = () => {
        onClose();
        router.push("../");
    };

    return (
        <Box>
            {time <= 0 ? (
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Modal Title</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>Time's up!</ModalBody>

                        <ModalFooter>
                            <Button
                                colorScheme="green"
                                mr={3}
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            <Button variant="ghost">Try Again</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            ) : (
                <Heading>
                    {hours.toString().padStart(2, "0")}:
                    {minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                </Heading>
            )}
        </Box>
    );
};
