"use client";

import { createUserIfNotExists } from "@/firebase/database/repositories/users";

import { AppUser } from "@/types/user";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { customTheme } from "@/theme/theme";
import { Quiz, QuizResponse } from "@/types/canvas";
import { getUploads } from "@/lib/functions";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase/database";
import { COLLECTION_NAME } from "@/lib/constants";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={customTheme}>
                <UserProvider>
                    <QuizStorageProvider>
                        <SidebarProvider>{children}</SidebarProvider>
                    </QuizStorageProvider>
                </UserProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}

interface IQuizStorageContext {
    selectedOptions: QuizResponse;
    setSelectedOptions: React.Dispatch<React.SetStateAction<QuizResponse>>;
    quizzes: (Quiz & { id: string })[];
    setQuizzes: React.Dispatch<React.SetStateAction<(Quiz & { id: string })[]>>;
    setQuiz: (
        quiz: Quiz & {
            id: string;
        }
    ) => void;
    searchString: string;
    setSearchString: React.Dispatch<React.SetStateAction<string>>;
}

export const QuizStorageContext = createContext<IQuizStorageContext>({
    selectedOptions: {},
    setSelectedOptions: () => {},
    quizzes: [],
    setQuizzes: () => {},
    setQuiz: (quiz) => {},
    searchString: "",
    setSearchString: () => {},
});

const QuizStorageProvider = ({ children }: { children: React.ReactNode }) => {
    const authCtx = useAuthContainer();
    const user = authCtx.user;

    const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<QuizResponse>({}); // [qnId: string]: QuizResponse
    const [searchString, setSearchString] = useState<string>("");

    // initial fetch
    useEffect(() => {
        if (user) {
            getUploads(user.uid).then((data) => {
                setQuizzes(data.data || []);
                setSelectedOptions({});
            });
        }
    }, [user]);

    const QuizStorageContainer: IQuizStorageContext = {
        selectedOptions,
        setSelectedOptions,
        quizzes,
        setQuizzes,
        setQuiz: (
            quiz: Quiz & {
                id: string;
            }
        ) => {
            setQuizzes((prev) => {
                const newQuizzes = [...prev];
                const index = newQuizzes.findIndex((qn) => qn.id === quiz.id);
                if (index !== -1) newQuizzes[index] = quiz;
                else newQuizzes.push(quiz);

                return newQuizzes;
            });
        },
        searchString,
        setSearchString,
    };

    useEffect(() => {
        if (user) {
            const docsRef = query(
                collection(db, COLLECTION_NAME),
                where("userUid", "==", user.uid)
            );
            const unsubscribe = onSnapshot(docsRef, {
                next: (querySnapshot) => {
                    setQuizzes((prev) => {
                        const newQuizzes: (Quiz & { id: string })[] = [...prev];

                        querySnapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                const quiz = change.doc.data() as Quiz & {
                                    id: string;
                                };
                                quiz.id = change.doc.id;
                                newQuizzes.push(quiz);
                            }
                            if (change.type === "modified") {
                                const quiz = change.doc.data() as Quiz & {
                                    id: string;
                                };
                                quiz.id = change.doc.id;
                                const index = newQuizzes.findIndex(
                                    (qn) => qn.id === quiz.id
                                );
                                if (index !== -1) newQuizzes[index] = quiz;
                                else newQuizzes.push(quiz);
                            } else {
                                // deleted
                                const id = change.doc.id;
                                const index = newQuizzes.findIndex(
                                    (qn) => qn.id === id
                                );
                                if (index !== -1) newQuizzes.splice(index, 1);
                            }
                        });
                        return newQuizzes;
                    });
                },
            });

            return () => unsubscribe();
        } else {
            return;
        }
    }, [user]);
    return (
        <QuizStorageContext.Provider value={QuizStorageContainer}>
            {children}
        </QuizStorageContext.Provider>
    );
};

export const useQuizContainer = () => useContext(QuizStorageContext);

// TODO: Refactor this to it's own file
// if no user, set to false.
interface IAuthContext {
    user?: AppUser | false;
    setUser: React.Dispatch<React.SetStateAction<AppUser | undefined | false>>;
}

// Load the user from localstorage
const storedUser = localStorage.getItem("user");

export const UserContext = createContext<IAuthContext>({
    user: storedUser ? JSON.parse(storedUser) : undefined,
    setUser: () => {},
});

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | false | undefined>(
        storedUser ? JSON.parse(storedUser) : undefined
    );

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
                if (appUser) {
                    // get the token
                    const token = localStorage.getItem("canvasApiToken");
                    setUser({
                        ...appUser,
                        canvasApiToken: token || "",
                    });
                    localStorage.setItem("user", JSON.stringify(appUser));
                } else {
                    setUser(false);
                    localStorage.removeItem("user");
                    localStorage.removeItem("canvasApiToken");
                }
            } else {
                setUser(false);
                localStorage.removeItem("user");
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
export const useSidebarContainer = () => useContext(SidebarContext);

interface ISidebarContext {
    isOpenSidebar: boolean;
    setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SidebarContext = createContext<ISidebarContext>({
    isOpenSidebar: true, // Set the default value for isOpen
    setIsOpenSidebar: () => {}, // Set a dummy function for setIsOpen
});
export const SidebarProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpenSidebar, setIsOpenSidebar] = useState(true);

    useEffect(() => {}, [isOpenSidebar]);
    return (
        <SidebarContext.Provider value={{ isOpenSidebar, setIsOpenSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};
