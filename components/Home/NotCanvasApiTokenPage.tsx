import { useState } from "react";
//import { useHistory } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { useAuthContainer } from "../../app/providers";
import { db } from "../../firebase/database/index";
import { AppUser } from "../../types/user";
import User from "firebase/auth";
import { useRouter } from "next/navigation";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Link,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { SUCCESS_TOAST_OPTIONS } from "@/lib/toasts";
const NotCanvasApiTokenPage = () => {
    const [token, setToken] = useState("");
    //const history = useHistory();
    const { user, setUser } = useAuthContainer();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const router = useRouter();
    const toast = useToast();
    const handleTokenSubmit = async (event: any) => {
        if (!user) return;

        // Update the user's document in Firebase with the Canvas API token
        setIsSubmitting(true);
        event.preventDefault();

        fetch("/api/validation", {
            method: "POST",
            body: JSON.stringify(token),
        })
            .then((res) => {
                if (!res.ok) {
                    return Promise.reject(res);
                }

                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    // set it in localstorage
                    localStorage.setItem("canvasApiToken", token);
                    const updatedUser = { ...user, canvasApiToken: token };
                    // const docRef = doc(db, "users", user.uid);

                    // const firebaseUser = JSON.parse(
                    //     JSON.stringify({ ...user, canvasApiToken: token })
                    // );
                    // updateDoc(docRef, firebaseUser);

                    // Update the hasToken state and redirect to the main page
                    // update the user's state in the auth container

                    setUser(updatedUser);
                    router.push("/");
                    toast({
                        ...SUCCESS_TOAST_OPTIONS,
                        title: "Canvas API Token updated.",
                        description: "You can now upload quizzes!",
                    });
                } else {
                    throw new Error("Invalid token");
                }
            })
            .catch((e) => {
                console.log(e);

                setErrorMessage("Invalid Canvas API Token!");
                setIsSubmitting(false);
            });
    };
    return (
        <>
            <Flex mt={8} direction="column" pb={16}>
                <Flex alignItems={"center"}>
                    <Heading fontWeight={"semibold"} fontSize="5xl">
                        We need your Canvas API token!
                    </Heading>
                </Flex>
                <form onSubmit={handleTokenSubmit}>
                    <Stack spacing={8} mt={{ base: 14, md: 28 }}>
                        <FormControl
                            id="token"
                            isRequired
                            // isInvalid={returningEmailIncorrect}
                            variant="floating_lg"
                        >
                            <Input
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                type="text"
                                // variant="flushed"
                                placeholder=" "
                                size={"lg"}
                                data-testid="token-input"
                            />
                            <FormLabel>Canvas API Token</FormLabel>

                            <FormHelperText>
                                Please click{" "}
                                <Link
                                    isExternal
                                    href="https://canvas.nus.edu.sg/profile/settings#access_tokens_holder"
                                    textDecor={"underline"}
                                >
                                    here
                                </Link>{" "}
                                to get your Canvas API Access Token.
                            </FormHelperText>
                            <FormHelperText>
                                Your token is not saved in our database. It is
                                only stored locally.
                            </FormHelperText>
                        </FormControl>

                        <Alert
                            status="error"
                            mt={6}
                            visibility={errorMessage ? "visible" : "hidden"}
                        >
                            <AlertIcon />
                            <Box>
                                <AlertTitle>{errorMessage}</AlertTitle>
                                {/* <AlertDescription>{errorMessage}</AlertDescription> */}
                            </Box>
                        </Alert>

                        <Box mt={12}>
                            <Button
                                isDisabled={!token.length}
                                isLoading={isSubmitting}
                                type="submit"
                                width="120px"
                                data-testid="token-submit"
                            >
                                Update token
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Flex>
        </>
    );
};

export default NotCanvasApiTokenPage;
