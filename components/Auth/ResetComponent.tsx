"use client";

import { createAccountEmail, signInEmail } from "@/firebase/auth/signup";
import { signInWithGoogle } from "@/firebase/auth/google";
import { NAVBAR_HEIGHT, PAGE_CONTAINER_SIZE } from "@/lib/constants";
import { ERROR_TOAST_OPTIONS, SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
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
import {
    redirect,
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useAuthContainer } from "@/app/providers";
import NotCanvasApiTokenPage from "../Home/NotCanvasApiTokenPage";

import AuthImage from "@/public/assets/auth.svg";
import Image from "next/image";
import DarkAuthImage from "@/public/assets/auth-dark.svg";
import { auth } from "@/firebase/config";
import { confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";

export default function ResetComponent() {
    const { user } = useAuthContainer();
    const router = useRouter();

    const [showAuthPerson] = useMediaQuery("(min-width: 1000px)");
    const isDarkMode = useColorModeValue(false, true);
    const toast = useToast();

    const [newPassword, setNewPassword] = useState("");

    const passwordIsValid = newPassword.trim().length >= 6;
    const [isResetting, setIsResetting] = useState(false);

    const [resetErrorMessage, setResetErrorMessage] = useState("");

    const params = useSearchParams();
    const oobCode = params && params.get("oobCode");

    const onReset = async () => {
        if (!newPassword || !oobCode) return;

        setIsResetting(true);
        setResetErrorMessage("");
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            console.log("success");
            toast({
                ...SUCCESS_TOAST_OPTIONS,
                title: "Password reset successfully!",
            });
            router.replace("/?login=true");
        } catch (e: any) {
            setResetErrorMessage(e.toString());
            if (e.toString().includes("invalid-action-code")) {
                setResetErrorMessage(
                    "The password reset link is invalid or has expired. Please request for a new link."
                );
            } else {
                setResetErrorMessage(e.toString());
            }
        } finally {
            setIsResetting(false);
        }
    };

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
                <Flex mt={8} direction="column" pb={16}>
                    <Flex alignItems={"center"}>
                        <Heading fontWeight={"semibold"} fontSize="5xl">
                            Reset your password
                        </Heading>
                    </Flex>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <Stack spacing={8} mt={{ base: 14, md: 28 }}>
                            <Box>
                                <FormControl
                                    id="password"
                                    isRequired
                                    isInvalid={
                                        !passwordIsValid && newPassword !== ""
                                    }
                                    variant="floating_lg"
                                >
                                    <Input
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                        }}
                                        type="password"
                                        // variant="flushed"
                                        placeholder="Enter your new password"
                                        size={"lg"}
                                    />
                                    <FormLabel>Password</FormLabel>

                                    {passwordIsValid || newPassword === "" ? (
                                        <FormHelperText>
                                            Your new password must be at least 6
                                            characters long.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>
                                            Your new password must be at least 6
                                            characters long.
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                                <Flex justifyContent={"end"}>
                                    <Button
                                        // colorScheme=""
                                        variant="ghost"
                                        onClick={() =>
                                            router.replace(
                                                "/?login=true&reset=true"
                                            )
                                        }
                                        size="xs"
                                    >
                                        Get new link
                                    </Button>
                                </Flex>
                            </Box>
                            {resetErrorMessage && (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertTitle mr={2}>Error!</AlertTitle>
                                    <AlertDescription>
                                        {resetErrorMessage}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Box></Box>
                            <Stack
                                direction={{ base: "column", md: "row" }}
                                mt={12}
                                spacing={8}
                            >
                                <Box>
                                    <Button
                                        onClick={onReset}
                                        isLoading={isResetting}
                                        type="submit"
                                        isDisabled={!passwordIsValid}
                                    >
                                        Reset password
                                    </Button>
                                </Box>
                            </Stack>

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
            </Container>
        </Container>
    );
}
