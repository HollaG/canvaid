import { useState } from "react";
//import { useHistory } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { useAuthContainer } from "../../app/providers";
import { db } from "../../firebase/database/index";
import { AppUser } from "../../types/user";
import User from "firebase/auth";
import { useRouter } from "next/navigation";
import { Stack } from "@chakra-ui/react";
const NotCanvasApiTokenPage = () => {
    const [token, setToken] = useState("");
    //const history = useHistory();
    const authCtx = useAuthContainer();
    const user = authCtx.user as AppUser;
    // const router = useRouter();

    // if (user?.canvasApiToken) {
    //     router.refresh();
    // }
    const handleTokenSubmit = async (event: any) => {
        // Update the user's document in Firebase with the Canvas API token
        event.preventDefault();
        try {
            const docRef = doc(db, "users", user.uid);

            const firebaseUser = JSON.parse(
                JSON.stringify({ ...user, canvasApiToken: token })
            );
            await updateDoc(docRef, firebaseUser);

            // Update the hasToken state and redirect to the main page
            // update the user's state in the auth container
            authCtx.setUser(firebaseUser);
        } catch (error) {
            console.log("Error updating token in Firebase:", error);
        }
    };
    return (
        <div>
            <Stack spacing={3} align="center">
                <h1> Insert tutorial for canvas api token here</h1>
                <form onSubmit={handleTokenSubmit}>
                    <input
                        type="text"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        placeholder="Insert Canvas API Token "
                        data-testid="token-input"
                    />
                    <button type="submit">Submit</button>
                </form>
            </Stack>
        </div>
    );
};

export default NotCanvasApiTokenPage;
