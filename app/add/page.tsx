"use client";

import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import {
    Button,
    Container,
    Flex,
    FormControl,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { FormEvent, useState } from "react";
import { IAddBody } from "../api/add/route";
import { useAuthContainer } from "../providers";

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
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("Submitted!");
                        router.push("/");
                    });
            });
        }
        // form.append("file", file);

        // console.log({ file });
    };

    return (
        <Container maxWidth={PAGE_CONTAINER_SIZE}>
            <Stack>
                <Heading fontSize={"3xl"}> Add a new quiz </Heading>
                <form action="/add" method="post" onSubmit={onSubmit}>
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
                </form>
            </Stack>
        </Container>
    );
}
