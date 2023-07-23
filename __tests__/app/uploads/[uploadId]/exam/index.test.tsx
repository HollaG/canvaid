import { QuizStorageContext, UserContext } from "@/app/providers";
import { AppRouterContextProviderMock } from "@/__mocks__/wrappers";
import "@testing-library/jest-dom";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    RenderResult,
} from "@testing-library/react";

import { act } from "react-dom/test-utils";

// Clean
import QUIZ from "@/__mocks__/quiz.json";

// "dirty" - has an annotation and has a flag
import DIRTY_QUIZ from "@/__mocks__/dirtyQuiz.json";
import QUIZZES from "@/__mocks__/quizzes.json";
import USER from "@/__mocks__/user.json";

import SELECTEDOPTIONS from "@/__mocks__/selectedOptions.json";

import QuizPage from "@/app/uploads/[quizUploadId]/page";
import ExamPage from "@/app/uploads/[quizUploadId]/exam/page";

import { useParams } from "next/navigation";
import {
    deleteQuizQuestionAnnotation,
    getQuizUpload,
    updateQuizQuestionFlag,
} from "@/firebase/database/repositories/uploads";

import mockRouter from "next-router-mock";
import { customTheme } from "@/theme/theme";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { convertCustomAttemptNumber } from "@/lib/functions";
import Sidebar from "@/components/Sidebar/Sidebar";
jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useParams: () => ({ quizUploadId: "123" }),
}));

// mock the firebase upload functions so we don't call firebase
// let mockDeleteAttempt: jest.Mock<any, any, any> = jest
//     .fn()
//     .mockImplementationOnce(() =>
//         Promise.resolve({
//             status: "deleted",
//             data: { ...QUIZ, submissions: [], selectedOptions: [] },
//         })
//     )
//     .mockImplementationOnce(() => Promise.resolve({ status: "deleted" }));

jest.mock("../../../../../firebase/database/repositories/uploads", () => {
    const originalModule = jest.requireActual(
        "../../../../../firebase/database/repositories/uploads"
    );

    return {
        __esModule: true,
        ...originalModule,
        getQuizUpload: jest.fn(() => Promise.resolve(DIRTY_QUIZ)),
        updateQuizQuestionFlag: jest.fn(() => Promise.resolve(QUIZ)),
        deleteQuizQuestionAnnotation: jest.fn(() => Promise.resolve(QUIZ)),
        deleteAttempt: jest.fn(),
        deleteQuiz: jest.fn(() => Promise.resolve()),
    };
});

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
    usePathname: () => "/uploads/CgBnvGYEayotCQXfrpi7/exam",
}));

const mockUploadId = "CgBnvGYEayotCQXfrpi7";

describe("Exam page rendering", () => {
    let renderResult: RenderResult;
    const push = jest.fn((url) => {});

    beforeEach(() => {
        // Mock the fetch request
        act(() => {
            mockRouter.push(
                `/uploads/${mockUploadId}/exam?num=8&length=120&random=true`
            );
        });
        // Mock the page
        renderResult = render(
            <AppRouterContextProviderMock router={{ push }}>
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            quizzes: QUIZZES as any,
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: {},
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <Box>
                                <Sidebar />
                                <ExamPage />
                            </Box>
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    it("should render the attempt number", async () => {
        const attemptFormat = convertCustomAttemptNumber(-10);

        expect(
            await screen.findByText(`Attempt #${attemptFormat}`)
        ).toBeInTheDocument();
    });

    it("should not display any `correct` or `incorrect`", async () => {
        expect(screen.queryByText(/CORRECT!/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/INCORRECT!/i)).not.toBeInTheDocument();
    });

    it("should have a disabled submit button", async () => {
        expect(
            (await screen.findByRole("button", { name: /submit/i })).closest(
                "button"
            )
        ).toBeDisabled();
    });

    // TODO: fix this test
    // it("should render the questions properly", async () => {
    //     // expect Question 8 to be displayed but 9 not
    //     // there is more than 1 "Question 8" and "Question 9" so we need to use queryAllByText
    //     expect(screen.queryAllByText(/Question 8/)).toHaveLength(2);
    //     expect(screen.queryAllByText(/Question 9/)).toHaveLength(0);
    // });

    it("should render a timer", async () => {
        expect(await screen.findByTestId("timer")).toBeInTheDocument();
    });
});

describe("Exam mode in progress", () => {
    let renderResult: RenderResult;
    const push = jest.fn((url) => {});

    beforeEach(() => {
        // Mock the fetch request
        act(() => {
            mockRouter.push(
                `/uploads/${mockUploadId}/exam?num=8&length=120&random=true`
            );
        });
        // Mock the page
        renderResult = render(
            <AppRouterContextProviderMock router={{ push }}>
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            quizzes: QUIZZES as any,
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: SELECTEDOPTIONS,
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <Box>
                                <Sidebar />
                                <ExamPage />
                            </Box>
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    it("should update the sidebar status when a question is correctly answered", async () => {
        // expect the undone indicator to not be present
        expect(
            screen.queryByTestId("indicator-undone")
        ).not.toBeInTheDocument();

        // TOOD: fix this test
        // the submit button should be enabled
        // expect(
        //     (await screen.findByRole("button", { name: /submit/i })).closest(
        //         "button"
        //     )
        // ).toHaveProperty("disabled", "");
    });

    it("should display a prompt before submitting", async () => {
        // click the submit button
        await act(async () =>
            fireEvent.click(
                await screen.findByRole("button", { name: /submit/i })
            )
        );
    });
});
