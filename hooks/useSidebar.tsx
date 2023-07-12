import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";

const useSidebar = () => {
    const [showSidebar] = useMediaQuery("(min-width: 48em)");
    return showSidebar;
};

export default useSidebar;
