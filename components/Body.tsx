"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { Stack } from "@chakra-ui/react";

/**
 * Renders the document body.
 *
 * @param param0
 * @returns
 */
const Body = ({ children }: { children: React.ReactNode }) => {
    return <Stack overflow="hidden">{children}</Stack>;
};

export default Body;
