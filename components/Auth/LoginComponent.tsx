"use client";

import { createAccountEmail, signInEmail } from "@/firebase/auth/signup";
import { signInWithGoogle } from "@/firebase/auth/google";
import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import {
    Box,
    Button,
    Center,
    Collapse,
    Container,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Stack,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useBreakpointValue,
    useColorModeValue,
    useMediaQuery,
    useSteps,
    useToast,
} from "@chakra-ui/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuthContainer } from "@/app/providers";
import NotCanvasApiTokenPage from "../Home/NotCanvasApiTokenPage";

import AuthImage from "@/public/assets/auth.svg";
import Image from "next/image";
import DarkAuthImage from "@/public/assets/auth-dark.svg";

export default function LoginComponent() {
    const { user } = useAuthContainer();
    const router = useRouter();
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

    const [isNew, setIsNew] = useState(false);

    // step 1: login / register
    // step 2: token
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (user) {
            setStep(1);
        }
    }, [user]);
    const steps = [
        { title: "Login", description: "Login or create your account" },
        { title: "API Token", description: "Update your Canvas API Token" },
    ];

    const { activeStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const stepperOrienation = useBreakpointValue({
        base: "vertical",
        md: "horizontal",
    });

    const [showAuthPerson] = useMediaQuery("(min-width: 1000px)");
    const isDarkMode = useColorModeValue(false, true);

    if (user && user.canvasApiToken) {
        // redirect back to home page
        // close the modal then redirect
        // redirect("/");
        // router.replace("/");
    }

    return (
        <Container maxW={PAGE_CONTAINER_SIZE}>
            {showAuthPerson && (
                <Box position="fixed" bottom={0} right={-76}>
                    <Image
                        src={isDarkMode ? DarkAuthImage : AuthImage}
                        alt="Image asking for authentication"
                    />
                </Box>
            )}
            <Container maxW="container.md" ml={0}>
                <Box>
                    <Stepper
                        index={activeStep}
                        orientation={stepperOrienation as any}
                    >
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>
                                        {step.description}
                                    </StepDescription>
                                </Box>

                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </Box>
                <Collapse in={step === 0}>
                    <Flex mt={8} direction="column" pb={16}>
                        <Flex alignItems={"center"}>
                            <Heading fontWeight={"semibold"} fontSize="5xl">
                                Do we know you?
                            </Heading>
                        </Flex>

                        <form>
                            <Stack spacing={8} mt={{ base: 14, md: 28 }}>
                                {!isNew ? (
                                    <>
                                        <FormControl
                                            id="email"
                                            isRequired
                                            isInvalid={returningEmailIncorrect}
                                            variant="floating_lg"
                                        >
                                            <Input
                                                value={returningEmail}
                                                onChange={(e) => {
                                                    setReturningEmail(
                                                        e.target.value
                                                    );
                                                    setReturningEmailIncorrect(
                                                        false
                                                    );
                                                }}
                                                type="email"
                                                // variant="flushed"
                                                placeholder=" "
                                                size={"lg"}
                                                data-testid="email-signin"
                                            />
                                            <FormLabel>Email</FormLabel>

                                            {!returningEmailIncorrect ? (
                                                <FormHelperText>
                                                    Please enter the email you
                                                    signed up with.
                                                </FormHelperText>
                                            ) : (
                                                <FormErrorMessage>
                                                    Email does not exist, please
                                                    sign up first!
                                                </FormErrorMessage>
                                            )}
                                        </FormControl>
                                        <FormControl
                                            id="password"
                                            isRequired
                                            isInvalid={
                                                returningPasswordIncorrect
                                            }
                                            variant="floating_lg"
                                        >
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
                                                // variant="flushed"
                                                placeholder=" "
                                                size={"lg"}
                                            />
                                            <FormLabel>Password</FormLabel>

                                            {!returningPasswordIncorrect ? (
                                                <FormHelperText>
                                                    Your password must be at
                                                    least 6 characters long.
                                                </FormHelperText>
                                            ) : (
                                                <FormErrorMessage>
                                                    Your password is incorrect!
                                                </FormErrorMessage>
                                            )}
                                        </FormControl>
                                    </>
                                ) : (
                                    <>
                                        <FormControl
                                            id="new-email"
                                            isRequired
                                            isInvalid={
                                                !(
                                                    newEmail === "" ||
                                                    emailIsValid
                                                )
                                            }
                                            variant="floating_lg"
                                        >
                                            <Input
                                                value={newEmail}
                                                onChange={(e) =>
                                                    setNewEmail(e.target.value)
                                                }
                                                type="email"
                                                size={"lg"}
                                                placeholder=" "
                                            />
                                            <FormLabel>Email</FormLabel>

                                            {newEmail === "" || emailIsValid ? (
                                                <FormHelperText>
                                                    Your email will be used to
                                                    sign in in future.
                                                </FormHelperText>
                                            ) : (
                                                <FormErrorMessage>
                                                    Email is invalid!
                                                </FormErrorMessage>
                                            )}
                                        </FormControl>
                                        <FormControl
                                            variant="floating_lg"
                                            id="new-password"
                                            isRequired
                                            isInvalid={
                                                !(
                                                    newPassword === "" ||
                                                    passwordIsValid
                                                )
                                            }
                                        >
                                            <Input
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                type="password"
                                                size={"lg"}
                                                placeholder=" "
                                            />
                                            <FormLabel>Password</FormLabel>
                                            {newPassword === "" ||
                                            passwordIsValid ? (
                                                <FormHelperText>
                                                    Your password must be at
                                                    least 6 characters long.
                                                </FormHelperText>
                                            ) : (
                                                <FormErrorMessage>
                                                    Your password must be at
                                                    least 6 characters long!
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
                                            variant="floating_lg"
                                        >
                                            <Input
                                                value={newConfirmPassword}
                                                onChange={(e) =>
                                                    setNewConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                type="password"
                                                size={"lg"}
                                                placeholder=" "
                                            />
                                            <FormLabel>
                                                Confirm Password
                                            </FormLabel>
                                            {newConfirmPassword === "" ||
                                            confirmSameAsNew ? (
                                                <FormHelperText>
                                                    Please re-type your
                                                    password.
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
                                                variant="floating_lg"
                                            >
                                                <Input
                                                    value={displayName}
                                                    onChange={(e) => {
                                                        setNewDisplayName(
                                                            e.target.value
                                                        );
                                                        setTouchedNewDisplayName(
                                                            true
                                                        );
                                                    }}
                                                    type="text"
                                                    size={"lg"}
                                                    placeholder=" "
                                                />
                                                <FormLabel>
                                                    Display Name
                                                </FormLabel>
                                            </FormControl>
                                        </Flex>
                                    </>
                                )}
                                <Box></Box>
                                <Stack
                                    direction={{ base: "column", md: "row" }}
                                    mt={12}
                                    spacing={8}
                                >
                                    <Box>
                                        {isNew ? (
                                            <Button
                                                onClick={onCreateAccount}
                                                isDisabled={!canCreate}
                                                isLoading={isSubmitting}
                                                type="submit"
                                                width="120px"
                                            >
                                                Sign up
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={signIn}
                                                isLoading={isSubmitting}
                                                type="submit"
                                                width="120px"
                                            >
                                                Sign in
                                            </Button>
                                        )}
                                    </Box>
                                    <Box>
                                        <Button
                                            variant="ghost"
                                            colorScheme={"gray"}
                                            onClick={() =>
                                                setIsNew((prev) => !prev)
                                            }
                                            width="200px"
                                        >
                                            {" "}
                                            {!isNew
                                                ? "I'm new!"
                                                : "I've been here before"}{" "}
                                        </Button>
                                    </Box>
                                </Stack>
                                <Box>
                                    <Button
                                        // w={"full"}
                                        variant={"outline"}
                                        leftIcon={<FcGoogle />}
                                        onClick={signInWithGoogle}
                                    >
                                        <Center>
                                            <Text>Sign in with Google</Text>
                                        </Center>
                                    </Button>
                                </Box>

                                {/* <Divider />

                            <Button
                                w={"full"}
                                variant={"outline"}
                                leftIcon={<FcGoogle />}
                                onClick={signInWithGoogle}
                            >
                                <Center>
                                    <Text>Sign in with Google</Text>
                                </Center>
                            </Button> */}
                                {/* <Stack spacing={4}>
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
                            </Stack> */}
                            </Stack>
                        </form>
                    </Flex>
                </Collapse>
                <Collapse in={step === 1}>
                    <NotCanvasApiTokenPage />
                </Collapse>
            </Container>
            {/* <Tabs variant="soft-rounded">
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
            </Tabs> */}
        </Container>
    );
}
