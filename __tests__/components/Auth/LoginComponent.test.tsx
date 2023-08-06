import "@testing-library/jest-dom";
import { render, fireEvent, waitFor, screen, renderHook } from '@testing-library/react';
import { useRouter } from "next/router";
import LoginComponent from "@/components/Auth/LoginComponent";
import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "@/theme/theme";
import { AppRouterContextProviderMock } from "../../../__mocks__/wrappers";
import { QuizStorageContext, UserContext } from "@/app/providers";
jest.mock("next/router", () => require("next-router-mock"));
jest.mock("next/navigation", () => ({
    ...require("next-router-mock"),
    useSearchParams: () => {
        const router = require("next-router-mock").useRouter();
        const path = router.asPath.split("?")?.[1] ?? "";
        return new URLSearchParams(path);
    },
    useParams: () => ({ quizUploadId: "CgBnvGYEayotCQXfrpi7" }),
}));
describe('LoginComponent', () => {
    it('should render the login form initially', () => {
render(
    <UserContext.Provider value={{ user: false, setUser: jest.fn() }}>
<AppRouterContextProviderMock router={{}}>
    <ChakraProvider theme = {customTheme}>
        <LoginComponent />
    </ChakraProvider>
</AppRouterContextProviderMock>
</UserContext.Provider>)
            
      // Assert that the login form is rendered
      expect(screen.getByText('Do we know you?')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });
}
)