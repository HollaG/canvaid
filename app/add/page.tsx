"use client";

import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { FormEvent, useCallback, useState } from "react";
import { IAddBody } from "../api/add/route";
import { useAuthContainer } from "../providers";
import { useDropzone } from "react-dropzone";
import { Quiz, QuizAttempt } from "@/types/canvas";

export default function Page() {
    const authObj = useAuthContainer();
    const router = useRouter();
    const user = authObj?.user;

    // 0: not uploading
    // 1: uploading
    // 2: done
    // 3: error
    // 4: incorrect file type
    const [isUploading, setIsUploading] = useState(0);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Do something with the files
            console.log("ONDROP called");
            if (!user) return;
            if (acceptedFiles.length && acceptedFiles[0] instanceof File) {
                setIsUploading(1);
                const file = acceptedFiles[0];
                console.log(file.type, " -0--------------");
                if (file.type !== "text/html") {
                    setIsUploading(4);
                    setTimeout(() => {
                        setIsUploading(0);
                    }, 2000);
                    console.log("invalid file type!!");
                    return;
                }
                file.text().then((txt: string) => {
                    const body: IAddBody = {
                        html: txt,
                        quizName: "",
                        course: "",
                        uid: user.uid,
                    };
                    fetch("/api/add", {
                        method: "POST",
                        body: JSON.stringify(body),
                    })
                        .then((res) => {
                            console.log(res);
                            return res.json();
                        })
                        .then(
                            (data: {
                                quizAttempt: QuizAttempt;
                                quiz: Quiz & {
                                    id: string;
                                };
                            }) => {
                                console.log("Submitted!");
                                console.log(data);
                                setIsUploading(2);
                                router.push(`/uploads/${data.quiz?.id}`);
                            }
                        )
                        .catch((e) => {
                            console.error(e);
                            setIsUploading(3);
                            setTimeout(() => {
                                setIsUploading(0);
                            }, 2000);
                        });
                });
            } else {
                setIsUploading(4);
                setTimeout(() => {
                    setIsUploading(0);
                }, 2000);
            }
        },
        [router, user]
    );
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
            accept: {
                "text/html": [".html", ".htm"],
            },
        });

    return (
        <Container maxWidth={PAGE_CONTAINER_SIZE}>
            <Stack>
                <Heading fontSize={"3xl"}> Add a new quiz </Heading>
                <Flex
                    w="100%"
                    h="250px"
                    bgColor={useColorModeValue("gray.200", "gray.700")}
                    justifyContent="center"
                    alignItems={"center"}
                    borderRadius="sm"
                >
                    <div
                        {...getRootProps()}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            textAlign: "center",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <input {...getInputProps()} data-testid="drop-input" />

                        <Text>
                            {isUploading === 0
                                ? isDragActive
                                    ? "Drop your file here!"
                                    : "Drag and drop your file here, or click to select a file"
                                : isUploading === 4
                                ? "Invalid file type! Please only upload .html files."
                                : isUploading === 3
                                ? "There was an error parsing your file! Please check to see if it's from the correct source (the completed quiz page)."
                                : "Your file is uploading, please wait..."}
                        </Text>
                    </div>
                </Flex>
                {/* <form action="/add" method="post" onSubmit={onSubmit}>
                    <Stack>
                        <FormControl>
                            <Stack>
                                <InputGroup>
                                    <InputLeftAddon children="Course code" />
                                    <Input
                                        value={course}
                                        onChange={(e) =>
                                            setCourse(e.target.value)
                                        }
                                        type="text"
                                        placeholder="Enter your course's code here"
                                        name="course"
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <InputLeftAddon children="Quiz name" />
                                    <Input
                                        type="text"
                                        placeholder="Enter your quiz name here"
                                        name="quiz_name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <InputLeftAddon children="Upload the quiz HTML file" />

                                    <Input name="upload" type="file" />
                                </InputGroup>
                            </Stack>
                        </FormControl>
                        <Flex justifyContent={"right"}>
                            <Button type="submit" colorScheme="blue">
                                Submit
                            </Button>
                        </Flex>
                    </Stack>
                </form> */}
            </Stack>
        </Container>
    );
}
