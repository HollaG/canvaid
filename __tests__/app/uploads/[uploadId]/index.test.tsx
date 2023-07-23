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

import QuizPage from "@/app/uploads/[quizUploadId]/page";

import { useParams } from "next/navigation";
import {
    deleteQuizQuestionAnnotation,
    getQuizUpload,
    updateQuizQuestionFlag,
} from "@/firebase/database/repositories/uploads";

import mockRouter from "next-router-mock";
import { customTheme } from "@/theme/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { getExaminableQuestions } from "@/lib/functions";
import { Quiz } from "@/types/canvas";

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

jest.mock("../../../../firebase/database/repositories/uploads", () => {
    const originalModule = jest.requireActual(
        "../../../../firebase/database/repositories/uploads"
    );

    return {
        __esModule: true,
        ...originalModule,
        getQuizUpload: jest.fn(() => Promise.resolve(DIRTY_QUIZ)),
        updateQuizQuestionFlag: jest.fn(() => Promise.resolve(QUIZ)),
        deleteQuizQuestionAnnotation: jest.fn(() => Promise.resolve(QUIZ)),
        deleteAttempt: jest
            .fn()
            .mockImplementationOnce(() => {
                // remove attempt 1 (for first test)
                const attemptIndex = QUIZ.submissions.findIndex(
                    (submission) => submission.attempt === 1
                );

                const copiedQuiz = JSON.parse(JSON.stringify(QUIZ));
                copiedQuiz.submissions.splice(attemptIndex, 1);
                copiedQuiz.selectedOptions.splice(attemptIndex, 1);
                return Promise.resolve({
                    status: "updated",
                    data: copiedQuiz,
                });
            })
            .mockImplementationOnce(() => {
                // remove attempt 1 (for second test)
                const attemptIndex = QUIZ.submissions.findIndex(
                    (submission) => submission.attempt === 1
                );

                const copiedQuiz = JSON.parse(JSON.stringify(QUIZ));
                copiedQuiz.submissions.splice(attemptIndex, 1);
                copiedQuiz.selectedOptions.splice(attemptIndex, 1);
                return Promise.resolve({
                    status: "updated",
                    data: copiedQuiz,
                });
            })
            .mockImplementationOnce(() =>
                Promise.resolve({ status: "deleted" })
            ),
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
}));

const mockUploadId = "CgBnvGYEayotCQXfrpi7";

describe("Quiz page rendering", () => {
    let renderResult: RenderResult;
    const push = jest.fn((url) => {});
    const setQuizMock = jest.fn((quiz) => {
        renderResult.rerender(
            <AppRouterContextProviderMock router={{ push }}>
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            // rerender with the updated quiz
                            quizzes: [quiz],
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });
    beforeEach(() => {
        // Mock the fetch request
        act(() => {
            mockRouter.push(`/uploads/${mockUploadId}`);
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
                            setQuiz: setQuizMock,
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    // teardown
    // afterEach(() => {
    //     jest.clearAllMocks();
    // });

    it("should display the quiz information", async () => {
        // console.log(getQuizUpload("123").then((res) => console.log(res)));

        expect(
            await screen.findByText(/SoC Teaching Workshop/)
        ).toBeInTheDocument();

        // both attempts should be there
        expect(
            await screen.findByText(
                `Attempt #1 (${
                    QUIZ.submissions.find(
                        (submissions) => submissions.attempt === 1
                    )!.score
                }/${QUIZ.quizInfo.points_possible})`
            )
        ).toBeInTheDocument();
        expect(
            await screen.findByText(
                `Attempt #2 (${
                    QUIZ.submissions.find(
                        (submissions) => submissions.attempt === 2
                    )!.score
                }/${QUIZ.quizInfo.points_possible})`
            )
        ).toBeInTheDocument();

        expect(getQuizUpload).not.toHaveBeenCalled();
    });

    it("should fetch quiz data if it's an external quiz", async () => {
        // 1) reset the context to not have any quizzes loaded to simulate loading someone else's quiz
        setQuizMock({
            id: "123",
        });

        // 2) expect a call to getQuizUpload to load the quiz
        expect(getQuizUpload).toHaveBeenCalledWith(mockUploadId);
    });

    it("should load the Combined Questions correctly", async () => {
        const combinedQuestionsButton = await screen.findByTestId(
            "combined-button"
        );

        expect(combinedQuestionsButton).toBeInTheDocument();
        combinedQuestionsButton.click();

        expect(
            await screen.findByTestId("combined-questions-list")
        ).toBeInTheDocument();
    });
});

describe("Quiz page editing", () => {
    let renderResult: RenderResult;
    const push = jest.fn((url) => {});
    const setQuizMock = jest.fn((quiz) => {
        renderResult.rerender(
            <AppRouterContextProviderMock router={{ push }}>
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            // rerender with the updated quiz
                            quizzes: [quiz],
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });
    beforeEach(() => {
        // Mock the fetch request
        mockRouter.setCurrentUrl("/");
        act(() => {
            mockRouter.push(`/uploads/${mockUploadId}`);
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
                            setQuiz: setQuizMock,
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    // teardown
    afterEach(() => {});

    it("should correctly unflag", async () => {
        const flaggedButton = await screen.findByLabelText("Unflag question");
        expect(flaggedButton).toBeInTheDocument();

        flaggedButton.click();

        expect(updateQuizQuestionFlag).toHaveBeenCalled();

        // no longer found (unflagged)
        // expect(
        //     await screen.findByLabelText("Unflag question")
        // ).not.toBeInTheDocument();
    });

    it("should correctly delete comments", async () => {
        const comment = await screen.findByText(/testing/);
        expect(comment).toBeInTheDocument();

        // try to remove it
        const removeButton = await screen.findByLabelText("Delete annotation");
        // should only have one
        expect(removeButton).toBeInTheDocument();

        removeButton.click();

        expect(deleteQuizQuestionAnnotation).toHaveBeenCalled();

        // no longer found (deleted)
        expect(await screen.findByText(/testing/)).not.toBeInTheDocument();
    });

    it("should show a warning before deleting an attempt", async () => {
        const deleteAttemptButton = await screen.findByTestId(
            "delete-attempt-1"
        );

        expect(deleteAttemptButton).toBeInTheDocument();

        deleteAttemptButton.click();

        const confirmDeleteAttemptButton = await screen.findByTestId(
            "confirm-delete-attempt"
        );

        expect(confirmDeleteAttemptButton).toBeInTheDocument();
    });

    it("should delete the attempt", async () => {
        await act(async () =>
            (await screen.findByTestId("delete-attempt-1")).click()
        );

        await act(async () =>
            (await screen.findByTestId("confirm-delete-attempt")).click()
        );

        // expect(mockDeleteAttempt).toHaveBeenCalled();

        // expect success message
        expect(
            screen.queryByText(
                `Attempt #1 (${
                    QUIZ.submissions.find(
                        (submissions) => submissions.attempt === 1
                    )!.score
                }/${QUIZ.quizInfo.points_possible})`
            )
        ).not.toBeInTheDocument();
    });

    it("should redirect to home page when there are no more attempts", async () => {
        await act(async () =>
            (await screen.findByTestId("delete-attempt-1")).click()
        );

        await act(async () =>
            (await screen.findByTestId("confirm-delete-attempt")).click()
        );

        await act(async () =>
            (await screen.findByTestId("delete-attempt-2")).click()
        );

        await act(async () =>
            (await screen.findByTestId("confirm-delete-attempt")).click()
        );

        expect(
            screen.queryByText(
                `Attempt #1 (${
                    QUIZ.submissions.find(
                        (submissions) => submissions.attempt === 1
                    )!.score
                }/${QUIZ.quizInfo.points_possible})`
            )
        ).not.toBeInTheDocument();

        expect(mockRouter).toMatchObject({
            asPath: "/",
            pathname: "/",
            query: {},
        });
    });

    it("should show a warning before deleting the quiz", async () => {
        const deleteQuizButton = await screen.findByTestId("delete-quiz");

        expect(deleteQuizButton).toBeInTheDocument();

        deleteQuizButton.click();

        const confirmDeleteQuizButton = await screen.findByTestId(
            "confirm-delete-quiz"
        );

        expect(confirmDeleteQuizButton).toBeInTheDocument();
    });

    it("should redirect to home page when deleting the quiz", async () => {
        await act(async () =>
            (await screen.findByTestId("delete-quiz")).click()
        );

        await act(async () =>
            (await screen.findByTestId("confirm-delete-quiz")).click()
        );

        expect(mockRouter).toMatchObject({
            asPath: "/",
            pathname: "/",
            query: {},
        });
    });
});
describe("Exam mode", () => {
    let renderResult: RenderResult;
    const push = jest.fn((url) => {});
    const setQuizMock = jest.fn((quiz) => {
        renderResult.rerender(
            <AppRouterContextProviderMock router={{ push }}>
                <UserContext.Provider
                    value={{
                        user: USER,
                        setUser: jest.fn(),
                    }}
                >
                    <QuizStorageContext.Provider
                        value={{
                            // rerender with the updated quiz
                            quizzes: [quiz],
                            searchString: "",
                            setQuiz: jest.fn(),
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });
    beforeEach(() => {
        // Mock the fetch request
        act(() => {
            mockRouter.push(`/uploads/${mockUploadId}`);
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
                            setQuiz: setQuizMock,
                            setSearchString: jest.fn(),
                            setQuizzes: jest.fn(),
                            selectedOptions: [],
                            setSelectedOptions: jest.fn(),
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <QuizPage />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    it("should render the exam mode button", async () => {
        const examModeButton = await screen.findByTestId("exam-mode-btn");

        expect(examModeButton).toBeInTheDocument();
    });

    it("should display a popup asking the user to customise their quiz and populate the default values", async () => {
        const examModeButton = await screen.findByTestId("exam-mode-btn");

        act(() => examModeButton.click());

        expect(
            await screen.findByText(/Customize your quiz/)
        ).toBeInTheDocument();

        // expect the number of questions to be filled in with the default value, which will be 12
        const questions = getExaminableQuestions(QUIZ as any);

        const questionNumberInput = await screen.findByTestId("input-numQns");
        const examLengthInput = await screen.findByTestId("input-examLength");
        const isRandomCheckbox = await screen.findByTestId("input-isRandom");

        expect(questionNumberInput).toHaveDisplayValue(
            questions.length.toString()
        );

        // expect clamp
        // expect(questionNumberInput).toHaveDisplayValue(
        //     questions.length.toString()
        // );

        // change to 8
        await act(async () =>
            fireEvent.change(questionNumberInput, {
                target: { value: "8" },
            })
        );

        // expect ok
        expect(questionNumberInput).toHaveDisplayValue("8");
    });

    it("should redirect to the exam page with the set parameters", async () => {
        const examModeButton = await screen.findByTestId("exam-mode-btn");
        act(() => examModeButton.click());

        const questions = getExaminableQuestions(QUIZ as any);

        const questionNumberInput = await screen.findByTestId("input-numQns");
        await act(async () =>
            fireEvent.change(questionNumberInput, {
                target: { value: "8" },
            })
        );
        const examLengthInput = await screen.findByTestId("input-examLength");
        await act(async () =>
            fireEvent.change(examLengthInput, {
                target: { value: "120" },
            })
        );

        const isRandomCheckbox = await screen.findByTestId("input-isRandom");
        await act(async () => fireEvent.click(isRandomCheckbox));

        const startBtn = await screen.findByTestId("start-exam-btn");
        expect(startBtn).toBeInTheDocument();

        await act(async () => fireEvent.click(startBtn));

        expect(mockRouter).toMatchObject({
            asPath: `/uploads/${mockUploadId}/exam?num=${8}&length=120&random=true`,
            pathname: `/uploads/${mockUploadId}/exam`,
            query: {
                num: `${8}`,
                length: "120",
                random: "true",
            },
        });
    });

    it("should redirect to the exam page with default parameters", async () => {
        const examModeButton = await screen.findByTestId("exam-mode-btn");
        act(() => examModeButton.click());

        const startBtn = await screen.findByTestId("start-exam-btn");

        await act(async () => fireEvent.click(startBtn));
        const questions = getExaminableQuestions(QUIZ as any);

        expect(mockRouter).toMatchObject({
            asPath: `/uploads/${mockUploadId}/exam?num=${questions.length}&length=undefined&random=false`,
            pathname: `/uploads/${mockUploadId}/exam`,
            query: {
                num: `${questions.length}`,
                length: "undefined",
                random: "false",
            },
        });
    });
});
