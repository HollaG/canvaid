import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";

/**
 * Hook to determine if the sidebar should be shown.
 *
 * Defaults to FALSE --> sidebar SHOW
 *
 * @returns
 */
const useSidebar = () => {
    const [showSidebar] = useMediaQuery("(min-width: 48em)");
    return showSidebar;
};

export default useSidebar;
