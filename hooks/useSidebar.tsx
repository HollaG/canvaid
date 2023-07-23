import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";

/**
 * Hook to determine if the sidebar should be shown.
 *
 *
 *
 * @returns
 */
const useSidebar = () => {
    const [showSidebar] = useMediaQuery("(max-width: 48em)");
    return !showSidebar;
};

export default useSidebar;
