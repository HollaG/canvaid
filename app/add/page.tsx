"use client";

import { Button, FormControl, Input, Stack, Text } from "@chakra-ui/react";
import { FormEvent } from "react";

export default function Page() {
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        // @ts-ignore
        console.log({ e: e.target[0].files[0] });

        // @ts-ignore
        if (!e.target[0].files[0]) return;

        // @ts-ignore
        const file = e.target[0].files[0];
        // body.append("file", file);

        if (file instanceof File) {
            file.text().then((txt: string) => {
                console.log({ txt });
                return fetch("/api/add", {
                    method: "POST",
                    body: JSON.stringify({
                        html: txt,
                        name: "Samepl name",
                    }),
                });
            });
        }
        // form.append("file", file);

        // console.log({ file });
    };

    return (
        <Stack>
            <Text> Add a new quiz </Text>
            <form action="/add" method="post" onSubmit={onSubmit}>
                <FormControl>
                    <Input name="upload" type="file" />
                </FormControl>
                <Button type="submit">Submit</Button>
            </form>
        </Stack>
    );
}
