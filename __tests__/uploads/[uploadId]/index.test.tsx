import { UserContext } from "@/app/providers";
import { AppRouterContextProviderMock } from "@/__mocks__/wrappers";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { act } from "react-dom/test-utils";
import QUIZ from "../../../__mocks__/quiz.json";
import USER from "../../../__mocks__/user.json";

import QuizPage from "@/app/uploads/[quizUploadId]/page";

import { useParams } from "next/navigation";
import { getQuizUpload } from "@/firebase/database/repositories/uploads";

jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useParams: () => ({ quizUploadId: "123" }),
}));

jest.mock("../../../firebase/database/repositories/uploads", () => {
    // ...jest.requireActual(
    //     "../../../firebase/database/repositories/uploads"
    // ),
    // getQuizUpload: jest.fn(() => Promise.resolve(QUIZ)),

    const originalModule = jest.requireActual(
        "../../../firebase/database/repositories/uploads"
    );

    console.log({ originalModule });
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    return {
        // __esModule: true,
        // ...originalModule,
        getQuizUpload: jest.fn(() => Promise.resolve(QUIZ)),
    };
});
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
                        }}
                    >
                        <QuizPage />
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
        // expect(global.fetch).toBeCalled();
        // console.log(getQuizUpload("123").then((res) => console.log(res)));

        expect(
            await screen.findByText(`${QUIZ.course}: ${QUIZ.quizName}`)
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
