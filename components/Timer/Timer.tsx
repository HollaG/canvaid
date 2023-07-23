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
    Center,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const Timer = ({ startTimeInMinutes }: { startTimeInMinutes: number }) => {
    const [time, setTime] = useState(startTimeInMinutes * 60);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalOpened, setModalOpened] = useState(false);

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    // Start the timer on component mount
    useEffect(() => {
        if (time == 0) {
            onOpen();
            return;
        }
        const timerId = setInterval(() => {
            setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : prevTime));
        }, 1000);

        return () => clearInterval(timerId); // Clear the interval on component unmount
    }, [time, onOpen]);
    // useEffect(() => {
    //     // Add modalOpenRef.current as a dependency to rerender when it changes
    // }, [modalOpenRef.current]);

    const handleClose = () => {
        onClose();
        setModalOpened(true);

        //modalOpenRef.current = false;
        //router.push("../");
    };
    return (
        <Center>
            {time == 0 && !modalOpened && (
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Exam has ended!</ModalHeader>
                        <ModalCloseButton onClick={handleClose} />
                        <ModalBody>Time&apos;s up!</ModalBody>

                        <ModalFooter>
                            <Button colorScheme="teal" onClick={handleClose}>
                                Continue
                            </Button>
                            {/* <Button variant="ghost">Continue</Button> */}
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
            <Heading fontSize="1.75em">
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
            </Heading>
        </Center>
    );
};

export default React.memo(Timer, (prevProps, nextProps) => {
    return prevProps.startTimeInMinutes === nextProps.startTimeInMinutes;
});
