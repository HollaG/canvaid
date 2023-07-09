import AddPage from "@/app/add/page";
import { UserContext } from "@/app/providers";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AppRouterContextProviderMock } from "../../__mocks__/wrappers";
import USER from "../../__mocks__/user.json";
import "@testing-library/jest-dom";

const uploadQuiz = jest.fn(() =>
    Promise.resolve({
        json: () =>
            Promise.resolve({
                data: { quiz: { id: "q" } },
            }),
    })
) as jest.Mock;
global.fetch = uploadQuiz;

describe("Add a new quiz page", () => {
    it("should drop", async () => {
        const push = jest.fn();

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
        );

        // see https://stackoverflow.com/questions/55181009/jest-react-testing-library-warning-update-was-not-wrapped-in-act
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

        expect(uploadQuiz).toBeCalled();
        expect(
            await screen.findByText(/Your file is uploading, please wait.../)
        ).toBeInTheDocument();
    });
});
