import "@testing-library/jest-dom";
import { render, fireEvent, waitFor, screen, renderHook, act } from '@testing-library/react';
import { useRouter } from "next/router";
import ResetComponent from "@/components/Auth/ResetComponent";
import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "@/theme/theme";
import { AppRouterContextProviderMock } from "../../../__mocks__/wrappers";
import { QuizStorageContext, UserContext } from "@/app/providers";
import userEvent from "@testing-library/user-event";
import { confirmPasswordReset, sendPasswordResetEmail } from "firebase/auth";
const mockRouterReplace = jest.fn();
jest.mock('next/router', () => ({
    useRouter: () => ({
      replace: mockRouterReplace ,
    }),
  }));

  
describe('ResetComponent', () => {
    it('should render the reset form initially', () => {
render(
    //<UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
<AppRouterContextProviderMock router={{}}>
    <ChakraProvider theme = {customTheme}>
        <ResetComponent />
    </ChakraProvider>
</AppRouterContextProviderMock>
//</UserContext.Provider>
)
        
      // Assert that the reset form is rendered
      expect(screen.getByText('Reset your password')).toBeInTheDocument();
  expect(screen.queryByText('Reset password')).toBeInTheDocument();
  expect(screen.queryByText("Get new link")).toBeInTheDocument();
      expect(screen.getByText('Your new password must be at least 6 characters long.')).toBeInTheDocument();
      //expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    }
)
it('going back should take you to the login page', () => {
    //const replace = jest.fn((url) => {return "/?login=true&reset=true"});
render(
    //<UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
<AppRouterContextProviderMock router={{ replace: mockRouterReplace }}>
    <ChakraProvider theme = {customTheme}>
        <ResetComponent />
    </ChakraProvider>
</AppRouterContextProviderMock>
//</UserContext.Provider>
)
      fireEvent.click(screen.getByRole('button', { name: "Get new link" }));
      expect(mockRouterReplace).toHaveBeenCalledWith("/?login=true&reset=true");
      //expect(screen.getByText('Do we know you?')).toBeInTheDocument();
    }
)
it("calls router.replace after successful password reset", async () => {
    jest.mock("next/navigation", () => ({
        useRouter: () => ({
          replace: jest.fn(), // Mock the router.replace function
        }),
        useSearchParams: () => ({
          get: jest.fn(() => "dummy_oobCode"), // Mock the oobCode value
        }),
      }));
      jest.mock("firebase/auth", () => ({
        confirmPasswordReset: jest.fn(),
      }));
      //const mockConfirmPasswordReset = require("firebase/auth").confirmPasswordReset;
    //   mockConfirmPasswordReset.mockImplementation((auth:any, oobCode:any, newPassword:any) => {
    //       // Return a resolved promise with the same arguments
    //       return Promise.resolve({
    //         auth,
    //         oobCode,
    //         newPassword,
    //       });
    //     });

    const newPassword = "testPassword";
    // Render the component
    //const { confirmPasswordReset, sendPasswordResetEmail } = require("firebase/auth");

    render(
        //<UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
    <AppRouterContextProviderMock router={{}}>
        <ChakraProvider theme = {customTheme}>
            <ResetComponent />
        </ChakraProvider>
    </AppRouterContextProviderMock>
    //</UserContext.Provider>
    )
    // Get the input field and the reset button
    const passwordInput = screen.getByPlaceholderText("Enter your new password");
    const resetButton = screen.getByText("Reset password");

    // Enter a new password
    fireEvent.change(passwordInput, { target: { value: newPassword } });

    // Mock the confirmPasswordReset function to resolve successfully
    const mockConfirmPasswordReset = require("firebase/auth").confirmPasswordReset;
    

    // Click the reset button
    fireEvent.click(screen.getByRole('button', { name: "Reset password" }));
    mockConfirmPasswordReset.mockResolvedValueOnce({});
    // Expect that confirmPasswordReset was called with the correct parameters
    // await waitFor(() => {expect(mockConfirmPasswordReset).toHaveBeenCalledWith(
    //     {},
    //     "dummy_oobCode",
    //     newPassword
    //   );})
    

    // Expect that router.replace was called with the correct URL
    const mockRouterReplace = require("next/navigation").useRouter().replace;
    expect(mockRouterReplace).toHaveBeenCalledWith("/?login=true");
  });

// it ( 'should show an error message if the password is too short', async () => {
//     const user = userEvent.setup();

//     render(
//         //<UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
//     <AppRouterContextProviderMock router={{}}>
//         <ChakraProvider theme = {customTheme}>
//             <ResetComponent />
//         </ChakraProvider>
//     </AppRouterContextProviderMock>
//     //</UserContext.Provider>
//     )
//      const password = screen.getByPlaceholderText("Enter your password here")
//      userEvent.type(password, '12345');
//      //await act(async () => await userEvent.type(password, "12345678901"));
//        // const submitButton = await screen.findByTestId("token-submit");
//         //await act(async () => await userEvent.click(submitButton));
//     //expect(screen.getByText('Your new password must be at least 6 characters long.')).toBeInTheDocument();


// }
//)

    



}
)