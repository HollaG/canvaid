import { useAuthContainer } from "@/app/providers";
import { auth } from "@/firebase/config";
import { updateUserColorChoice } from "@/firebase/database/repositories/users";
import { AppUser } from "@/types/user";
import { Flex, useColorModeValue, Text, Box, Input } from "@chakra-ui/react";
import React, {
    MouseEvent,
    MouseEventHandler,
    useEffect,
    useState,
} from "react";

const CourseInfo = ({
    courseCode,
    courseName,
    uploadId,
    Button,
}: {
    courseCode: string;
    courseName: string;
    uploadId?: string;
    Button?: JSX.Element;
}) => {
    const { user, setUser } = useAuthContainer();

    const [selectedColor, setSelectedColor] = useState<string>(
        user ? user.courseColors[courseCode] || "#718096" : "#718096"
    );

    const [scrollPosBeforeClick, setScrollPosBeforeClick] = useState(
        window.scrollY
    );
    useEffect(() => {
        if (!user || selectedColor === user.courseColors[courseCode]) return;

        // set document height to scrollPosBeforeClick + 100vh
        // document.body.style.height = `${scrollPosBeforeClick + 100}vh`;
        const timeout = setTimeout(() => {
            // update the selected color for this course
            try {
                updateUserColorChoice(user.uid, courseCode, selectedColor).then(
                    () => {
                        // auth.currentUser?.reload();
                        // update locally
                        setUser((prev) =>
                            prev
                                ? ({
                                      ...prev,
                                      courseColors: {
                                          ...prev.courseColors,
                                          [courseCode]: selectedColor,
                                      },
                                  } as AppUser)
                                : false
                        );
                        // reset scroll pos

                        setTimeout(() => {
                            window.scrollTo(0, scrollPosBeforeClick);
                        }, 150);
                    }
                );
            } catch (e) {
                console.log(e);
            }
        }, 500);

        return () => clearTimeout(timeout);

        // Note: including the user in the dependency array will cause an infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedColor, courseCode]);

    const handleColorIconClick = (
        e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
    ) => {
        e.stopPropagation();
        setScrollPosBeforeClick(window.scrollY);
    };

    return (
        <Flex
            width="full"
            bgColor={useColorModeValue("gray.100", "gray.800")}
            borderRadius={"xl"}
            boxShadow="sm"
            p={3}
            alignItems="center"
            justifyContent="space-between"
        >
            {/* Course color */}
            <Flex alignItems={"center"}>
                <Box
                    bgColor={
                        user
                            ? user.courseColors[courseCode] || "#718096"
                            : "#718096"
                    }
                    borderRadius={"lg"}
                    height="28px"
                    width="28px"
                    mr={3}
                    onClick={(e) => handleColorIconClick(e)}
                >
                    <Input
                        type="color"
                        opacity={0}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        value={selectedColor}
                    />
                </Box>
                <Box>
                    <Text
                        fontWeight="bold"
                        overflow={"hidden"}
                        display="-webkit-box"
                        style={{
                            WebkitLineClamp: 2,
                            lineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                        wordBreak="break-word"
                    >
                        {courseCode}
                    </Text>
                    <Text
                        overflow={"hidden"}
                        display="-webkit-box"
                        style={{
                            WebkitLineClamp: 2,
                            lineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                        wordBreak="break-word"
                    >
                        {" "}
                        {courseName}
                    </Text>
                </Box>
            </Flex>
            <Box flexShrink={0}>{Button}</Box>
        </Flex>
    );
};

export default React.memo(CourseInfo, () => true);
