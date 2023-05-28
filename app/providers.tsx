"use client";

import googleAuth from "@/firebase/google";
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
    user?: User;
}

const UserContext = createContext<IAuthContext | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    const AuthContainer: IAuthContext = {
        user,
    };

    // Set up a listener to check when the auth state changes
    useEffect(() => {
        const unsubscribe = googleAuth.onAuthStateChanged(async (user) => {
            setUser(user);
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
