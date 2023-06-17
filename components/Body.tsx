"use client";

import { Stack } from "@chakra-ui/react";

/**
 * Renders the document body.
 *
 * @param param0
 * @returns
 */
const Body = ({ children }: { children: React.ReactNode }) => {
    return <Stack p={4}>{children}</Stack>;
};

export default Body;
