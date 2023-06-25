"use client";

import { createAccountEmail, signInEmail } from "@/firebase/auth/signup";
import { signInWithGoogle } from "@/firebase/auth/google";
import { PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import {
    Button,
    Center,
    Container,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useToast,
} from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { FaGithub, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuthContainer } from "../providers";

export default function Page() {
    const { user } = useAuthContainer();

    const [returningEmail, setReturningEmail] = useState("");
    const [returningPassword, setReturningPassword] = useState("");

    const [returningEmailIncorrect, setReturningEmailIncorrect] =
        useState(false);
    const [returningPasswordIncorrect, setReturningPasswordIncorrect] =
        useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [displayName, setNewDisplayName] = useState("");

    const [touchedNewFirstName, setTouchedNewDisplayName] = useState(false);

    const emailIsValid = newEmail.includes("@");
    const passwordIsValid = newPassword.trim().length >= 6;
    const confirmSameAsNew = newConfirmPassword === newPassword;
    const newFirstNameValid = displayName.trim().length;

    const canCreate =
        emailIsValid &&
        passwordIsValid &&
        confirmSameAsNew &&
        newFirstNameValid;

    const toast = useToast();
    const onCreateAccount = async () => {
        // simple email validation
        if (!canCreate) {
            return;
        }

        try {
            setIsSubmitting(true);
            await createAccountEmail(newEmail, newPassword, displayName);
            toast({
                title: "Account created.",
                description:
                    "You have been signed in! You can now upload your quizzes.",
                ...SUCCESS_TOAST_OPTIONS,
            });
        } catch (e: any) {
            if (e.toString().includes("invalid-email")) {
                toast({
                    title: "Error creating account!",
                    description:
                        "The provided email is invalid. Please provide a valid email address.",
                    ...ERROR_TOAST_OPTIONS,
                });
            } else if (e.toString().includes("email-already-in-use")) {
                toast({
                    title: "Error creating account!",
                    description:
                        "This email already exists. Please sign in instead.",
                    ...ERROR_TOAST_OPTIONS,
                });
            } else
                toast({
                    title: "Unexpected error",
                    description: e.toString(),
                    ...ERROR_TOAST_OPTIONS,
                });
        } finally {
            setIsSubmitting(false);
        }
    };

    const signIn = async () => {
        try {
            setIsSubmitting(true);
            await signInEmail(returningEmail, returningPassword);
        } catch (e: any) {
            console.log({ e });
            if (
                e.toString().includes("invalid-email") ||
                e.toString().includes("user-not-found")
            ) {
                setReturningEmailIncorrect(true);
            } else if (
                e.toString().includes("wrong-password") ||
                e.toString().includes("invalid-password")
            ) {
                setReturningPasswordIncorrect(true);
            } else {
                toast({
                    title: "Unexpected error",
                    description: e.toString(),
                    ...ERROR_TOAST_OPTIONS,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (user) {
        // redirect back to home page
        redirect("/");
    }

    return (
        <Container maxW={PAGE_CONTAINER_SIZE}>
            <Tabs variant="soft-rounded" isFitted>
                <TabList>
                    <Tab>Returning User</Tab>
                    <Tab>New User</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <form>
                            <Stack spacing={4}>
                                <FormControl
                                    id="email"
                                    isRequired
                                    isInvalid={returningEmailIncorrect}
                                >
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        value={returningEmail}
                                        onChange={(e) => {
                                            setReturningEmail(e.target.value);
                                            setReturningEmailIncorrect(false);
                                        }}
                                        type="email"
                                    />
                                    {!returningEmailIncorrect ? (
                                        <FormHelperText>
                                            Please enter the email you signed up
                                            with.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Email does not exist, please sign up
                                            first!
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <FormControl
                                    id="password"
                                    isRequired
                                    isInvalid={returningPasswordIncorrect}
                                >
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        value={returningPassword}
                                        onChange={(e) => {
                                            setReturningPassword(
                                                e.target.value
                                            );
                                            setReturningPasswordIncorrect(
                                                false
                                            );
                                        }}
                                        type="password"
                                    />
                                    {!returningPasswordIncorrect ? (
                                        <FormHelperText>
                                            Your password must be at least 6
                                            characters long.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Your password is incorrect!
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <Stack>
                                    <Button
                                        colorScheme="purple"
                                        onClick={signIn}
                                        isLoading={isSubmitting}
                                        type="submit"
                                    >
                                        Sign in
                                    </Button>
                                </Stack>
                                <Divider />

                                <Button
                                    w={"full"}
                                    variant={"outline"}
                                    leftIcon={<FcGoogle />}
                                    onClick={signInWithGoogle}
                                >
                                    <Center>
                                        <Text>Sign in with Google</Text>
                                    </Center>
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>
                    <TabPanel>
                        <form>
                            <Stack spacing={4}>
                                <FormControl
                                    id="new-email"
                                    isRequired
                                    isInvalid={
                                        !(newEmail === "" || emailIsValid)
                                    }
                                >
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        value={newEmail}
                                        onChange={(e) =>
                                            setNewEmail(e.target.value)
                                        }
                                        type="email"
                                    />
                                    {newEmail === "" || emailIsValid ? (
                                        <FormHelperText>
                                            Your email will be used to sign in
                                            in future.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Email is invalid!
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <FormControl
                                    id="new-password"
                                    isRequired
                                    isInvalid={
                                        !(newPassword === "" || passwordIsValid)
                                    }
                                >
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        type="password"
                                    />
                                    {newPassword === "" || passwordIsValid ? (
                                        <FormHelperText>
                                            Your password must be at least 6
                                            characters long.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Your password must be at least 6
                                            characters long!
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <FormControl
                                    id="new-confirm-password"
                                    isRequired
                                    isInvalid={
                                        !(
                                            newConfirmPassword === "" ||
                                            confirmSameAsNew
                                        )
                                    }
                                >
                                    <FormLabel>Confirm Password</FormLabel>
                                    <Input
                                        value={newConfirmPassword}
                                        onChange={(e) =>
                                            setNewConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                    />
                                    {newConfirmPassword === "" ||
                                    confirmSameAsNew ? (
                                        <FormHelperText>
                                            Please re-type your password.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Passwords do not match!
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <Flex flexDir={"row"}>
                                    <FormControl
                                        mr={1}
                                        id="new-firstname"
                                        isRequired
                                        isInvalid={
                                            displayName.trim() === "" &&
                                            touchedNewFirstName
                                        }
                                    >
                                        <FormLabel>Display Name</FormLabel>
                                        <Input
                                            value={displayName}
                                            onChange={(e) => {
                                                setNewDisplayName(
                                                    e.target.value
                                                );
                                                setTouchedNewDisplayName(true);
                                            }}
                                            type="text"
                                        />
                                        {/* <HelperText></HelperText> */}
                                    </FormControl>
                                </Flex>
                                <Stack spacing={10}>
                                    <Button
                                        colorScheme="purple"
                                        onClick={onCreateAccount}
                                        isDisabled={!canCreate}
                                        isLoading={isSubmitting}
                                        type="submit"
                                    >
                                        Sign up
                                    </Button>
                                </Stack>
                                <Divider />
                                <Button
                                    w={"full"}
                                    variant={"outline"}
                                    leftIcon={<FcGoogle />}
                                    onClick={signInWithGoogle}
                                >
                                    <Center>
                                        <Text>Sign up with Google</Text>
                                    </Center>
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Container>
    );
}
