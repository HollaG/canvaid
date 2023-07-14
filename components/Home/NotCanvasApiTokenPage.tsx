import { useState } from "react";
//import { useHistory } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { useAuthContainer } from "../../app/providers";
import { db } from "../../firebase/database/index";
import { AppUser } from "../../types/user";
import User from "firebase/auth";
import { useRouter } from "next/navigation";
import {
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
} from "@chakra-ui/react";
const NotCanvasApiTokenPage = () => {
    const [token, setToken] = useState("");
    //const history = useHistory();
    const authCtx = useAuthContainer();
    const user = authCtx.user as AppUser;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleTokenSubmit = async (event: any) => {
        // Update the user's document in Firebase with the Canvas API token
        setIsSubmitting(true);
        event.preventDefault();
        try {
            fetch("/api/validation", {
                method: "POST",
                body: JSON.stringify(token),
            })
                .then((res) => {
                    console.log(res);
                    return res.json();
                })
                .then((data) => {
                    if (data.success) {
                        const docRef = doc(db, "users", user.uid);

                        const firebaseUser = JSON.parse(
                            JSON.stringify({ ...user, canvasApiToken: token })
                        );
                        updateDoc(docRef, firebaseUser);

                        // Update the hasToken state and redirect to the main page
                        // update the user's state in the auth container
                        authCtx.setUser(firebaseUser);
                    } else {
                        console.log("Invalid token");
                    }
                })
                .catch(console.error);
        } catch (error) {
            console.log("Error updating token in Firebase:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Flex mt={8} direction="column">
            <Flex alignItems={"center"}>
                <Heading fontWeight={"semibold"} fontSize="5xl">
                    We need your Canvas API token!
                </Heading>
            </Flex>
            <form onSubmit={handleTokenSubmit}>
                <Stack spacing={8} mt={28}>
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
                    </FormControl>
                    <Box></Box>
                    <Box mt={12}>
                        <Button
                            isDisabled={!token.length}
                            isLoading={isSubmitting}
                            type="submit"
                            width="120px"
                        >
                            Update token
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Flex>
    );
};

export default NotCanvasApiTokenPage;
