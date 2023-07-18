import { enableFetchMocks } from "jest-fetch-mock";
import "jest-fetch-mock";

import HomePage from "@/app/page";
import { QuizStorageContext, UserContext } from "@/app/providers";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import USER from "../__mocks__/user.json";
import QUIZZES from "../__mocks__/quizzes.json";

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

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: jest.fn(),
});

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

describe("Home page", () => {
    it("should render a not-logged in home page", async () => {
        const push = jest.fn((url) => {});
        const searchParams = {
            get: jest.fn(() => ""),
        };

        jest.mock("next/navigation", () => ({
            ...(jest.requireActual("next/navigation") as object),
            useSearchParams: () => [searchParams],
        }));

        render(
            <AppRouterContextProviderMock router={{ push }}>
                <HomePage />
            </AppRouterContextProviderMock>
        );

        const getStartedBtn = await screen.findByTestId("cta-btn");
        expect(getStartedBtn).toBeInTheDocument();
    });

    it("should render a input Canvas token page", async () => {
        const searchParams = {
            get: jest.fn(() => ""),
            login: true,
        };

        const mockSetUser = jest.fn((user: AppUser | false | undefined) => {
            console.log({ user });
            rerender(
                <AppRouterContextProviderMock router={{}}>
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
                </AppRouterContextProviderMock>
            );
        });

        const { rerender } = await act(() =>
            render(
                <AppRouterContextProviderMock router={{}}>
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
                </AppRouterContextProviderMock>
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

        const tokenInput = await screen.findByTestId("token-input");

        expect(tokenInput).toBeInTheDocument();

        // // mock token
        // await act(async () => await userEvent.type(tokenInput, "12345678901"));

        // fetchMock.mockResponseOnce(JSON.stringify({ success: false }));
        // // fetchMock.mockReject(new Error("fake error message"));
        // // click submit

        // const submitButton = await screen.findByTestId("token-submit");

        // expect(submitButton).toBeInTheDocument();

        // await userEvent.click(submitButton);

        // expect(
        //     await screen.findByText(/Invalid Canvas API Token!/)
        // ).toBeInTheDocument();
        // fetchMock.mockClear();
        // fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        // await userEvent.click(submitButton);

        // userEvent.click(await screen.findByTestId("token-submit"));

        // expect a redirect to the homepage
        // expect(mockSetUser).toHaveBeenCalled();

        // expect(mockRouter).toMatchObject({
        //     asPath: "/",
        //     pathname: "/",
        //     query: {},
        // });
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
                    <HomePage />
                </UserContext.Provider>
            )
        );

        expect(await screen.findByTestId("add-new-btn")).toBeInTheDocument();
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
                        }}
                    >
                        <HomePage />
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            )
        );

        // expect the homepage to display the title of the course, in this case
        // SOCT101 SoC Teaching Workshop
        // expect there to be two cards

        expect(
            await screen.findAllByText(/SoC Teaching Workshop/)
        ).toHaveLength(2);

        // // expect there to only one card
        // expect(await screen.findByText(/23\/24 S1/)).toBeInTheDocument();
    });
});
