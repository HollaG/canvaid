import HomePage from "@/app/page";
import { UserContext } from "@/app/providers";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import USER from "../__mocks__/user.json";
import QUIZZES from "../__mocks__/quizzes.json";
import { act } from "react-dom/test-utils";

const getQuizData = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ data: QUIZZES }),
    })
) as jest.Mock;
global.fetch = getQuizData;

describe("Home page", () => {
    it("should render a not-logged in home page", async () => {
        render(<HomePage />);

        const getStartedBtn = await screen.findByTestId("cta-btn");
        expect(getStartedBtn).toBeInTheDocument();
    });

    // TODO
    it("should render a input Canvas token page", () => {});

    it("should render a logged-in home page", async () => {
        act(() =>
            render(
                <UserContext.Provider
                    value={{
                        user: USER,
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
                    }}
                >
                    <HomePage />
                </UserContext.Provider>
            )
        );

        // Fetch server with database ID
        expect(getQuizData).toHaveBeenCalledWith("/api/?uid=1234567890");

        // expect the homepage to display the title of the course, in this case
        // SOCT101 SoC Teaching Workshop
        expect(
            await screen.findByText(/SOCT101 SoC Teaching Workshop/)
        ).toBeInTheDocument();

        // expect there to only be one card with two attempts
        expect(await screen.findByText(/Attempt #2/)).toBeInTheDocument();
    });
});
