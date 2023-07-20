import {
    extendTheme,
    StyleConfig,
    withDefaultColorScheme,
} from "@chakra-ui/react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const activeLabelStyles = {
    transform: "scale(0.85) translateY(-24px)",
};
const activeLargeLabelStyles = {
    transform: "scale(0.85) translateY(-24px)",
};

const components: Record<string, StyleConfig> = {
    Form: {
        variants: {
            // @ts-ignore
            floating: ({ colorMode }) => ({
                container: {
                    _focusWithin: {
                        label: {
                            ...activeLabelStyles,
                        },
                    },
                    "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
                        {
                            ...activeLabelStyles,
                        },
                    label: {
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        position: "absolute",
                        backgroundColor:
                            colorMode === "dark" ? "#171923" : "white",
                        pointerEvents: "none",
                        mx: 3,
                        px: 1,
                        my: 2,
                        transformOrigin: "left top",
                    },
                },
            }),
            // @ts-ignore
            floating_alt: ({ colorMode }) => ({
                container: {
                    _focusWithin: {
                        label: {
                            ...activeLabelStyles,
                        },
                    },
                    "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
                        {
                            ...activeLabelStyles,
                        },
                    label: {
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        position: "absolute",
                        backgroundColor:
                            colorMode === "dark" ? "#171923" : "#f7fafc",
                        pointerEvents: "none",
                        mx: 3,
                        px: 1,
                        my: 2,
                        transformOrigin: "left top",
                    },
                },
            }),
            // @ts-ignore
            floating_alt_perm: ({ colorMode }) => ({
                container: {
                    label: {
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        position: "absolute",
                        backgroundColor:
                            colorMode === "dark" ? "#171923" : "#f7fafc",
                        pointerEvents: "none",
                        mx: 3,
                        px: 1,
                        my: 2,
                        transformOrigin: "left top",
                        ...activeLabelStyles,
                    },
                },
            }),
            // @ts-ignore
            floating_lg: ({ colorMode }) => ({
                container: {
                    _focusWithin: {
                        label: {
                            ...activeLabelStyles,
                        },
                    },
                    "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
                        {
                            ...activeLabelStyles,
                        },
                    label: {
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        position: "absolute",
                        backgroundColor:
                            colorMode === "dark" ? "#171923" : "white",
                        pointerEvents: "none",
                        mx: 3,
                        px: 1,
                        my: 3, // changed 2 to 3
                        transformOrigin: "left top",
                    },
                },
            }),
        },
    },
};
export const theme = extendTheme({
    components,
    fonts: {
        body: inter.style.fontFamily,
        heading: inter.style.fontFamily,
    },
});

export const customTheme = extendTheme(
    theme,
    withDefaultColorScheme({ colorScheme: "teal" })
);
