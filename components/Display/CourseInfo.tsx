import { useAuthContainer } from "@/app/providers";
import { auth } from "@/firebase/config";
import { updateUserColorChoice } from "@/firebase/database/repositories/users";
import { AppUser } from "@/types/user";
import { Flex, useColorModeValue, Text, Box, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const CourseInfo = ({
    courseCode,
    courseName,
    Button,
}: {
    courseCode: string;
    courseName: string;
    Button?: JSX.Element;
}) => {
    const { user, setUser } = useAuthContainer();

    const [selectedColor, setSelectedColor] = useState<string>(
        user ? user.courseColors[courseCode] || "gray.500" : "gray.500"
    );

    useEffect(() => {
        if (!user || selectedColor === user.courseColors[courseCode]) return;
        const timeout = setTimeout(async () => {
            // update the selected color for this course
            try {
                console.log("Updating...");
                await updateUserColorChoice(
                    user.uid,
                    courseCode,
                    selectedColor
                );

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
            } catch (e) {
                console.log(e);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [selectedColor, courseCode]);

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
                            ? user.courseColors[courseCode] || "gray.500"
                            : "gray.500"
                    }
                    borderRadius={"lg"}
                    height="28px"
                    width="28px"
                    mr={3}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Input
                        type="color"
                        opacity={0}
                        defaultValue={
                            user
                                ? user.courseColors[courseCode] || "gray.500"
                                : "gray.500"
                        }
                        onChange={(e) => setSelectedColor(e.target.value)}
                        value={selectedColor}
                    />
                </Box>
                <Box>
                    <Text fontWeight="bold">{courseCode}</Text>
                    <Text>{courseName}</Text>
                </Box>
            </Flex>
            {Button}
        </Flex>
    );
};

export default CourseInfo;
