import { QuizStorageContext, UserContext } from "@/app/providers";
import { AppRouterContextProviderMock } from "@/__mocks__/wrappers";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { act } from "react-dom/test-utils";
import QUIZ from "../../../__mocks__/quiz.json";
import USER from "../../../__mocks__/user.json";

import QuizPage from "@/app/uploads/[quizUploadId]/page";

import { useParams } from "next/navigation";
import { getQuizUpload } from "@/firebase/database/repositories/uploads";
import QUIZZES from "../../../__mocks__/quizzes.json";

import mockRouter from "next-router-mock";
jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useParams: () => ({ quizUploadId: "123" }),
}));

jest.mock("../../../firebase/database/repositories/uploads", () => {
    const originalModule = jest.requireActual(
        "../../../firebase/database/repositories/uploads"
    );

    return {
        __esModule: true,
        ...originalModule,
        getQuizUpload: jest.fn(() => Promise.resolve(QUIZ)),
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
    const push = jest.fn((url) => {});

    beforeEach(() => {
        // Mock the fetch request

        // Mock the page
        return act(() =>
            render(
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
                            }}
                        >
                            <QuizPage />
                        </QuizStorageContext.Provider>
                    </UserContext.Provider>
                </AppRouterContextProviderMock>
            )
        );
    });

    // teardown
    // afterEach(() => {
    //     jest.clearAllMocks();
    // });

    it("should display the quiz information", async () => {
        // console.log(getQuizUpload("123").then((res) => console.log(res)));
        act(() => {
            mockRouter.push("/uploads/CgBnvGYEayotCQXfrpi7");
        });
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
});
