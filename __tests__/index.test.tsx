import HomePage from "@/app/page";
import { UserContext } from "@/app/providers";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Home page", () => {
    it("should render a not-logged in home page", () => {
        render(<HomePage />);

        const getStartedBtn = screen.getByTestId("cta-btn");
        expect(getStartedBtn).toBeInTheDocument();
    });

    it("should render a logged-in home page", () => {
        const mockUser = {
            canvasApiToken: "",
            displayName: "test",
            email: "",
            photoURL: "",
            uid: "",
            uploadedIds: [],
        };
        render(
            <UserContext.Provider
                value={{
                    user: mockUser,
                }}
            >
                <HomePage />
            </UserContext.Provider>
        );

        expect(screen.getByTestId("add-new-btn")).toBeInTheDocument();
    });
});
