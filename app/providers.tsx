"use client";

import { createUserIfNotExists } from "@/firebase/database/repositories/users";
import googleAuth from "@/firebase/google";
import { AppUser } from "@/types/user";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

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
}

const UserContext = createContext<IAuthContext | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser>();

    const AuthContainer: IAuthContext = {
        user,
    };

    // Set up a listener to check when the auth state changes
    useEffect(() => {
        const unsubscribe = googleAuth.onAuthStateChanged(async (user) => {
            const appUser: AppUser = {
                displayName: user?.displayName || "",
                email: user?.email || "",
                photoURL: user?.photoURL || "",
                uid: user?.uid || "",
                uploadedIds: [],
                canvasApiToken: "",
            };
            if (user) setUser(appUser);

            if (user) {
                // add to db if not exist
                createUserIfNotExists(
                    JSON.parse(JSON.stringify(appUser))
                ).catch(console.log);
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
