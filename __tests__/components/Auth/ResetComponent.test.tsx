import "@testing-library/jest-dom";
import {
    render,
    fireEvent,
    waitFor,
    screen,
    renderHook,
    act,
} from "@testing-library/react";
import { auth } from "@/firebase/config";
import { useRouter } from "next/router";
import ResetComponent from "@/components/Auth/ResetComponent";
import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "@/theme/theme";
import { AppRouterContextProviderMock } from "../../../__mocks__/wrappers";
import { QuizStorageContext, UserContext } from "@/app/providers";
import userEvent from "@testing-library/user-event";
import { confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";
import { before } from "node:test";
const mockRouterReplace = jest.fn();
jest.mock("next/router", () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

jest.mock("firebase/auth", () => ({
    ...jest.requireActual("firebase/auth"), // Keep all the actual exports from firebase/auth
    confirmPasswordReset: jest.fn((auth, oobCode, newPassword) => {
        // Provide a manual implementation for the function
        if (newPassword === "validPassword" && oobCode === "validOobCode") {
            return Promise.resolve(); // Return a resolved promise without a value since the function returns void.
        } else {
            return Promise.reject(new Error("Invalid or expired link"));
        }
    }),
}));
describe("ResetComponent", () => {
    it("should render the reset form initially", () => {
        render(
            //<UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
            <AppRouterContextProviderMock router={{}}>
                <ChakraProvider theme={customTheme}>
                    <ResetComponent />
                </ChakraProvider>
            </AppRouterContextProviderMock>
            //</UserContext.Provider>
        );

        // Assert that the reset form is rendered
        expect(screen.getByText("Reset your password")).toBeInTheDocument();
        expect(screen.queryByText("Reset password")).toBeInTheDocument();
        expect(screen.queryByText("Get new link")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Your new password must be at least 6 characters long."
            )
        ).toBeInTheDocument();
    });
    it("going back should take you to the login page", () => {
        render(
            <AppRouterContextProviderMock
                router={{ replace: mockRouterReplace }}
            >
                <ChakraProvider theme={customTheme}>
                    <ResetComponent />
                </ChakraProvider>
            </AppRouterContextProviderMock>
        );
        fireEvent.click(screen.getByRole("button", { name: "Get new link" }));
        expect(mockRouterReplace).toHaveBeenCalledWith(
            "/?login=true&reset=true"
        );
    });
    it("confirms password reset after clicking reset button", async () => {
        jest.mock("next/navigation", () => ({
            useSearchParams: () => ({
                get: () => "validOobCode", // Provide the correct oobCode value here
            }),
        }));
        // jest.mock("next/navigation", () => ({
        //     useRouter: () => ({
        //         replace: jest.fn(), // Mock the router.replace function
        //     }),
        //     useSearchParams: () => ({
        //         get: jest.fn(() => "dummy_oobCode"), // Mock the oobCode value
        //     }),
        // }));

        const newPassword = "validPassword";
        const setIsResetting = jest.fn();
        const setResetErrorMessage = jest.fn();
        const toast = jest.fn();
        const oobCode = "your-oob-code";
        render(
            <AppRouterContextProviderMock
                router={{ replace: mockRouterReplace }}
            >
                <ChakraProvider theme={customTheme}>
                    <ResetComponent />
                </ChakraProvider>
            </AppRouterContextProviderMock>
        );
        // Get the input field and the reset button
        const passwordInput = screen.getByPlaceholderText(
            "Enter your new password"
        );
        const resetButton = screen.getByText("Reset password");
        fireEvent.change(passwordInput, { target: { value: newPassword } });
        // Click the reset button

        fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
        //const mockRouterReplace =
        //require("next/navigation").useRouter().replace;
        expect(mockRouterReplace).toHaveBeenCalledWith("/?login=true");
    });
});
