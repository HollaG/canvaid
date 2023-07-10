"use client";

import { createUserIfNotExists } from "@/firebase/database/repositories/users";

import { AppUser } from "@/types/user";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/config";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider>
                <UserProvider>{children}</UserProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}

// TODO: Refactor this to it's own file
interface IAuthContext {
    user?: AppUser;
    setUser: React.Dispatch<React.SetStateAction<AppUser | undefined>>;
}

export const UserContext = createContext<IAuthContext>({
    user: undefined,
    setUser: () => {},
});

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser>();

    const AuthContainer: IAuthContext = {
        user,
        setUser,
    };

    // Set up a listener to check when the auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            // const appUser: AppUser = {
            //     displayName: user?.displayName || "",
            //     email: user?.email || "",
            //     photoURL: user?.photoURL || "",
            //     uid: user?.uid || "",
            //     uploadedIds: [],
            //     canvasApiToken: "",
            // };
            // if (user) setUser(appUser);
            // else setUser(undefined);

            if (user) {
                // add to db if not exist
                const appUser = await createUserIfNotExists(
                    JSON.parse(JSON.stringify(user))
                ).catch(console.log);
                if (appUser) setUser(appUser);
                else setUser(undefined);
            } else {
                setUser(undefined);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={AuthContainer}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuthContainer = () => useContext(UserContext);
