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
    const [course, setCourse] = useState("");
    const [name, setName] = useState("");

    const authObj = useAuthContainer();
    const router = useRouter();
    const user = authObj?.user;
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // @ts-ignore
        console.log({ e: e.target[2].files[0] });

        // @ts-ignore
        if (!e.target[2].files[0]) return;

        // @ts-ignore
        const file = e.target[2].files[0];
        // body.append("file", file);

        if (file instanceof File) {
            file.text().then((txt: string) => {
                const body: IAddBody = {
                    html: txt,
                    quizName: name,
                    course,
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
                    .then((data) => {
                        console.log("Submitted!");
                        router.push("/");
                    })
                    .catch(console.error);
            });
        }
        // form.append("file", file);

        // console.log({ file });
    };

    // 0: not uploading
    // 1: uploading
    // 2: done
    // 3: error
    const [isUploading, setIsUploading] = useState(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        console.log("ONDROP called");
        if (!user) return;
        if (acceptedFiles.length && acceptedFiles[0] instanceof File) {
            setIsUploading(1);
            const file = acceptedFiles[0];
            console.log("received file", file);
            file.text().then((txt: string) => {
                const body: IAddBody = {
                    html: txt,
                    quizName: name,
                    course,
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
                            router.push(`/uploads/${data.quiz.id}`);
                        }
                    )
                    .catch(console.error);
            });
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
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
                        <input {...getInputProps()} />

                        <Text>
                            {isUploading === 0
                                ? isDragActive
                                    ? "Drop your file here!"
                                    : "Drag and drop your file here, or click to select a file"
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
