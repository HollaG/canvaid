import AddPage from "@/app/add/page";
import { UserContext } from "@/app/providers";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AppRouterContextProviderMock } from "../../__mocks__/wrappers";
import USER from "../../__mocks__/user.json";
import "@testing-library/jest-dom";

describe("Add a new quiz page", () => {
    const push = jest.fn((url) => {});

    // setup
    beforeEach(() => {
        // Mock the fetch request
        const uploadQuiz = jest.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        quiz: { id: "123" },
                    }),
            })
        ) as jest.Mock;
        global.fetch = uploadQuiz;

        // Mock the page
        return act(() =>
            render(
                <AppRouterContextProviderMock router={{ push }}>
                    <UserContext.Provider
                        value={{
                            user: USER,
                        }}
                    >
                        <AddPage />
                    </UserContext.Provider>
                </AppRouterContextProviderMock>
            )
        );
    });

    // teardown
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should drop", async () => {
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

        // expect the upload quiz fetch request
        expect(global.fetch).toBeCalled();

        // expect the loading message
        expect(
            await screen.findByText(/Your file is uploading, please wait.../)
        ).toBeInTheDocument();

        // expect a redirect to the quiz page
        expect(push).toHaveBeenCalledWith("/uploads/123");
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

        expect(global.fetch).not.toBeCalled();
        expect(
            await screen.findByText(
                /Invalid file type! Please only upload .html files./
            )
        ).toBeInTheDocument();
    });
    it("should show an error when the html file is invalid", async () => {
        // override mock fetch to return failure

        await act(async () => {
            window.URL.createObjectURL = jest
                .fn()
                .mockImplementation(() => "url");
            const inputEl = screen.getByTestId("drop-input");
            const file = new File(["<html></html>"], "test.html", {
                type: "html",
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

        // TODO: write a proper response object
    });
});
