import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

export const customTheme = extendTheme(
    withDefaultColorScheme({ colorScheme: "teal" })
);
