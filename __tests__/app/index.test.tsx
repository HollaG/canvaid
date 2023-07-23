import { enableFetchMocks } from "jest-fetch-mock";
import "jest-fetch-mock";

import HomePage from "@/app/page";
import { QuizStorageContext, UserContext } from "@/app/providers";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import USER from "@/__mocks__/user.json";
import QUIZZES from "@/__mocks__/quizzes.json";
import QUIZ from "@/__mocks__/quiz.json";

import { AppUser } from "@/types/user";
import { AppRouterContextProviderMock } from "@/__mocks__/wrappers";

import mockRouter from "next-router-mock";
import { customTheme } from "@/theme/theme";
import { ChakraProvider } from "@chakra-ui/react";
// const validateToken = jest.fn(() =>
//     Promise.resolve({
//         json: () => Promise.resolve({ success: true }),
//     })
// ) as jest.Mock;
// global.fetch = validateToken;
jest.mock("next/navigation");

// hacky workaround for structuredClone
global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));

// Mocks next/navigation.
// see https://github.com/scottrippey/next-router-mock/issues/67#issuecomment-1561164934
jest.mock("next/router", () => require("next-router-mock"));
jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useSearchParams: () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const router = require("next-router-mock").useRouter();
        const path = router.asPath.split("?")?.[1] ?? "";
        return new URLSearchParams(path);
    },
    useParams: () => ({ quizUploadId: "CgBnvGYEayotCQXfrpi7" }),
}));

jest.mock("firebase/firestore", () => ({
    ...jest.requireActual("firebase/firestore"),
    updateDoc: jest.fn(),
}));

jest.setTimeout(16000);

describe("Home page", () => {
    it("should render a not-logged in home page", async () => {
        render(<HomePage />);

        const getStartedBtn = await screen.findByTestId("cta-btn");
        expect(getStartedBtn).toBeInTheDocument();
    });

    it("should render a login / signup page", async () => {
        await act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: false,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );

        const getStartedBtn = await screen.findByTestId("cta-btn");
        await act(async () => {
            await userEvent.click(getStartedBtn);
        });

        await act(async () => {
            mockRouter.push("/?login=true");
        });
        const emailSignInInput = await screen.findByTestId("email-signin");
        expect(emailSignInInput).toBeInTheDocument();
    });

    it("should render a input Canvas token page", async () => {
        await act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: { ...USER, canvasApiToken: "" },
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );

        const getStartedBtn = await screen.findByTestId("cta-btn");

        expect(getStartedBtn).toBeInTheDocument();

        await act(async () => {
            mockRouter.push("/?login=true");
        });
        expect(mockRouter).toMatchObject({
            asPath: "/?login=true",
            pathname: "/",
            query: { login: "true" },
        });
    });

    it("should display an error when an invalid token is entered", async () => {
        act(() =>
            render(
                // <AppRouterContextProviderMock router={{}}>
                <UserContext.Provider
                    value={{
                        user: { ...USER, canvasApiToken: "" },
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
                // </AppRouterContextProviderMock>
            )
        );

        const tokenInput = await screen.findByTestId("token-input");

        expect(tokenInput).toBeInTheDocument();

        // mock token
        await act(async () => await userEvent.type(tokenInput, "12345678901"));
        const submitButton = await screen.findByTestId("token-submit");
        fetchMock.mockResponseOnce(JSON.stringify({ success: false }));
        // fetchMock.mockReject(new Error("fake error message"));
        // click submit

        expect(submitButton).toBeInTheDocument();

        await userEvent.click(submitButton);

        expect(
            await screen.findByText(/Invalid Canvas API Token!/)
        ).toBeInTheDocument();
    });

    it("should redirect to home page if correct token", async () => {
        const mockSetUser = jest.fn((user: AppUser | false | undefined) => {
            rerender(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            );
        });

        const { rerender } = await act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: { ...USER, canvasApiToken: "" },
                        setUser: mockSetUser as any,
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );
        const tokenInput = await screen.findByTestId("token-input");

        await act(async () => await userEvent.type(tokenInput, "12345678901"));
        const submitButton = await screen.findByTestId("token-submit");

        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
        await act(async () => await userEvent.click(submitButton));

        // expect a redirect to the homepage
        expect(mockSetUser).toHaveBeenCalled();

        expect(mockRouter).toMatchObject({
            asPath: "/",
            pathname: "/",
            query: {},
        });
    });

    it("should render a logged-in home page", async () => {
        act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );

        expect(await screen.findByTestId("add-new-btn")).toBeInTheDocument();
        expect(await screen.findByTestId("exam-mode-btn")).toBeInTheDocument();
    });

    it("should get and display user data", async () => {
        await act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            quizzes: QUIZZES as any,
                            setQuizzes: jest.fn(),
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                            examQuestionList: [],
                            setExamQuestionList: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <HomePage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            )
        );

        // expect the homepage to display the title of the course, in this case
        // SOCT101 SoC Teaching Workshop
        // expect there to be 1 cards

        expect(
            await screen.findAllByText(/SoC Teaching Workshop/)
        ).toHaveLength(1);

        // // expect there to only one card
        // expect(await screen.findByText(/23\/24 S1/)).toBeInTheDocument();
    });

    it("should display the Upload Quiz dialog", async () => {
        act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <HomePage />
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );
        // get the upload button
        const uploadBtn = await screen.findByTestId("add-new-btn");
        // click it
        await act(async () => await userEvent.click(uploadBtn));

        // expect the upload dialog to be in the document
        expect(await screen.findByTestId("drop-input")).toBeInTheDocument();
    });

    it("should display the Exam mode dialog", async () => {
        act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <QuizStorageContext.Provider
                            value={{
                                quizzes: QUIZZES as any,
                                searchString: "",
                                setQuiz: jest.fn(),
                                setSearchString: jest.fn(),
                                setQuizzes: jest.fn(),
                                selectedOptions: {},
                                setSelectedOptions: jest.fn(),
                                examQuestionList: [],
                                setExamQuestionList: jest.fn(),
                            }}
                        >
                            <ChakraProvider theme={customTheme}>
                                <HomePage />
                            </ChakraProvider>
                        </QuizStorageContext.Provider>
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );

        const examModeBtn = await screen.findByTestId("exam-mode-btn");

        await act(async () => await userEvent.click(examModeBtn));

        expect(await screen.findByTestId("exam-component")).toBeInTheDocument();

        // quiz name and course name should be there
        // course only has one because the homepage splits the course name
        expect(await screen.findByText(QUIZ.course)).toBeInTheDocument();

        // quiz name should appear three times IF the sidebar is rendered (one homepage, one dialog, one sidebar)
        // no sidebar, so only 2
        expect(screen.queryAllByText(QUIZ.quizName)).toHaveLength(2);
    });

    it("should allow going to the next step when user input is correct", async () => {
        act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <ChakraProvider theme={customTheme}>
                        <QuizStorageContext.Provider
                            value={{
                                quizzes: QUIZZES as any,
                                searchString: "",
                                setQuiz: jest.fn(),
                                setSearchString: jest.fn(),
                                setQuizzes: jest.fn(),
                                selectedOptions: {},
                                setSelectedOptions: jest.fn(),
                                examQuestionList: [],
                                setExamQuestionList: jest.fn(),
                            }}
                        >
                            <ChakraProvider theme={customTheme}>
                                <HomePage />
                            </ChakraProvider>
                        </QuizStorageContext.Provider>
                    </ChakraProvider>
                </UserContext.Provider>
            )
        );
        const examModeBtn = await screen.findByTestId("exam-mode-btn");

        await act(async () => await userEvent.click(examModeBtn));

        // next step should be disabled beacuse not selected
        expect(await screen.findByTestId("next-btn")).toBeDisabled();

        // should be enabled when quiz name and at least one is chosen
        const checkboxes = await screen.findAllByTestId("checkbox-quiz");
        // select the first one
        await act(async () => await userEvent.click(checkboxes[0]));

        // write something in the quiz name
        const quizNameInput = await screen.findByTestId("input-quizName");
        await act(
            async () => await userEvent.type(quizNameInput, "test quiz name")
        );

        // expect the next button to be enabled
        expect(await screen.findByTestId("next-btn")).toBeEnabled();
    });
});
