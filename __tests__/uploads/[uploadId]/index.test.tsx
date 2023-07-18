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
import QUIZ from "../../../__mocks__/quiz.json";

// "dirty" - has an annotation and has a flag
import QUIZZES from "../../../__mocks__/quizzes.json";
import USER from "../../../__mocks__/user.json";

import QuizPage from "@/app/uploads/[quizUploadId]/page";

import { useParams } from "next/navigation";
import {
    deleteQuizQuestionAnnotation,
    getQuizUpload,
    updateQuizQuestionFlag,
} from "@/firebase/database/repositories/uploads";

import mockRouter from "next-router-mock";
jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useParams: () => ({ quizUploadId: "123" }),
}));

// mock the firebase upload functions so we don't call firebase
jest.mock("../../../firebase/database/repositories/uploads", () => {
    const originalModule = jest.requireActual(
        "../../../firebase/database/repositories/uploads"
    );

    return {
        __esModule: true,
        ...originalModule,
        getQuizUpload: jest.fn(() => Promise.resolve(QUIZ)),
        updateQuizQuestionFlag: jest.fn(() => Promise.resolve(QUIZ)),
        deleteQuizQuestionAnnotation: jest.fn(() => Promise.resolve(QUIZ)),
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

describe("View a quiz page", () => {
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
                        }}
                    >
                        <QuizPage />
                    </QuizStorageContext.Provider>
                </UserContext.Provider>
            </AppRouterContextProviderMock>
        );
    });
    beforeEach(() => {
        // Mock the fetch request
        act(() => {
            mockRouter.push("/uploads/CgBnvGYEayotCQXfrpi7");
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
                        }}
                    >
                        <QuizPage />
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
    });

    it("should display a question as flagged", async () => {
        const flaggedButton = await screen.findByLabelText("Unflag question");
        expect(flaggedButton).toBeInTheDocument();

        flaggedButton.click();

        expect(updateQuizQuestionFlag).toHaveBeenCalled();

        // no longer found (unflagged)
        expect(
            await screen.findByLabelText("Unflag question")
        ).not.toBeInTheDocument();
    });

    it("should display a comment", async () => {
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
});
