import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();
import { QuizStorageContext, UserContext } from "@/app/providers";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AppRouterContextProviderMock } from "../../../__mocks__/wrappers";
import USER from "../../../__mocks__/user.json";
import "@testing-library/jest-dom";
import AddComponent from "@/components/Add/AddComponent";
import { customTheme } from "@/theme/theme";
import { ChakraProvider } from "@chakra-ui/react";

// Clean
import QUIZ from "@/__mocks__/quiz.json";

// "dirty" - has an annotation and has a flag
import DIRTY_QUIZ from "@/__mocks__/dirtyQuiz.json";
import QUIZZES from "@/__mocks__/quizzes.json";
import { deleteAttempt } from "@/firebase/database/repositories/uploads";
import mockRouter from "next-router-mock";
fetchMock.mockResponse(
    JSON.stringify({
        quiz: QUIZ,
        quizAttempt: {
            ...QUIZ,
            submission: QUIZ.submissions[0],
            selectedOptions: QUIZ.selectedOptions[0],
        },
    })
);

jest.mock("../../../firebase/database/repositories/uploads", () => {
    const originalModule = jest.requireActual(
        "../../../firebase/database/repositories/uploads"
    );

    return {
        __esModule: true,
        ...originalModule,

        deleteAttempt: jest.fn().mockImplementationOnce(() => {
            // remove attempt 1 (for first test)

            const copiedQuiz = JSON.parse(JSON.stringify(QUIZ));
            copiedQuiz.submissions.splice(0, 1);
            copiedQuiz.selectedOptions.splice(0, 1);
            return Promise.resolve({
                status: "updated",
                data: copiedQuiz,
            });
        }),
    };
});

describe("Add a new quiz page", () => {
    const push = jest.fn((url) => {});

    let renderResult: any;
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
                        }}
                    >
                        <ChakraProvider theme={customTheme}>
                            <AddComponent onClose={jest.fn()} />
                        </ChakraProvider>
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });

    // setup
    beforeEach(() => {
        // Mock the fetch request
        // const uploadQuiz = jest.fn(() =>
        //     Promise.resolve({
        //         json: () =>
        //             Promise.resolve({
        //                 quiz: { id: "123" },
        //             }),
        //     })
        // ) as jest.Mock;
        // global.fetch = uploadQuiz;

        // Mock the page
        return act(() => {
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
                                // rerender with the updated quiz
                                quizzes: [],
                                searchString: "",
                                setQuiz: jest.fn(),
                                setSearchString: jest.fn(),
                                setQuizzes: jest.fn(),
                            }}
                        >
                            <ChakraProvider theme={customTheme}>
                                <AddComponent onClose={jest.fn()} />
                            </ChakraProvider>
                        </QuizStorageContext.Provider>
                    </UserContext.Provider>
                </AppRouterContextProviderMock>
            );
        });
    });

    // teardown
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should drop", async () => {
        expect(await screen.findByTestId("step-1")).toBeInTheDocument();
        // see https://stackoverflow.com/questions/55181009/jest-react-testing-library-warning-update-was-not-wrapped-in-act
        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["<html></html>"], "test.html", {
                type: "text/html",
            });

            // see https://stackoverflow.com/a/63807258/21945438
            File.prototype.text = jest
                .fn()
                .mockImplementation(() => Promise.resolve("text"));

            Object.defineProperty(inputEl, "files", {
                value: [file],
            });
            fireEvent.drop(inputEl);
        });

        expect(
            await screen.findByText(/Your file is uploading, please wait.../)
        ).toBeInTheDocument();

        expect(await screen.findByTestId("step-2")).toBeInTheDocument();
    });
    it("should reject non-html files", async () => {
        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["test test text txt"], "test.txt", {
                type: "text/plain",
            });

            // see https://stackoverflow.com/a/63807258/21945438
            File.prototype.text = jest
                .fn()
                .mockImplementation(() => Promise.resolve("text"));

            Object.defineProperty(inputEl, "files", {
                value: [file],
            });
            fireEvent.drop(inputEl);
        });

        expect(await screen.findByTestId("alert-error")).toBeInTheDocument();
    });
    it("should show an error when the html file is invalid", async () => {
        fetchMock.mockRejectOnce(() => Promise.reject({ statusText: "error" }));
        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["<html></html>"], "test.html", {
                type: "text/html",
            });

            // see https://stackoverflow.com/a/63807258/21945438
            File.prototype.text = jest
                .fn()
                .mockImplementation(() => Promise.resolve("text"));

            Object.defineProperty(inputEl, "files", {
                value: [file],
            });
            fireEvent.drop(inputEl);
        });
        expect(await screen.findByTestId("alert-error")).toBeInTheDocument();
    });

    it("should undo the upload by deleting", async () => {
        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["<html></html>"], "test.html", {
                type: "text/html",
            });

            // see https://stackoverflow.com/a/63807258/21945438
            File.prototype.text = jest
                .fn()
                .mockImplementation(() => Promise.resolve("text"));

            Object.defineProperty(inputEl, "files", {
                value: [file],
            });
            fireEvent.drop(inputEl);
        });

        const undoBtn = await screen.findByTestId("undo-btn");
        expect(undoBtn).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(undoBtn);
        });

        expect(deleteAttempt).toBeCalled();

        // back to step 1
        expect(await screen.findByTestId("step-1")).toBeInTheDocument();
    });

    it("should redirect the user to the quiz page when accepted", async () => {
        // simulate 'adding' to the context'
        const mockOnClose = jest.fn();
        await act(async () =>
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
                                quizzes: [QUIZ as any],
                                searchString: "",
                                setQuiz: jest.fn(),
                                setSearchString: jest.fn(),
                                setQuizzes: jest.fn(),
                            }}
                        >
                            <ChakraProvider theme={customTheme}>
                                <AddComponent onClose={mockOnClose} />
                            </ChakraProvider>
                        </QuizStorageContext.Provider>
                    </UserContext.Provider>
                </AppRouterContextProviderMock>
            )
        );

        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["<html></html>"], "test.html", {
                type: "text/html",
            });

            // see https://stackoverflow.com/a/63807258/21945438
            File.prototype.text = jest
                .fn()
                .mockImplementation(() => Promise.resolve("text"));

            Object.defineProperty(inputEl, "files", {
                value: [file],
            });
            fireEvent.drop(inputEl);
        });

        const acceptBtn = await screen.findByTestId("accept-btn");
        expect(acceptBtn).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(acceptBtn);
        });

        expect(mockOnClose).toHaveBeenCalled();
    });
});
