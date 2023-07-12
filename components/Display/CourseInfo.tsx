import { Flex, useColorModeValue, Text, Box } from "@chakra-ui/react";

const CourseInfo = ({
    courseCode,
    courseName,
}: {
    courseCode: string;
    courseName: string;
}) => {
    return (
        <Flex
            width="full"
            bgColor={useColorModeValue("gray.100", "gray.800")}
            borderRadius={"xl"}
            boxShadow="sm"
            p={3}
            alignItems="center"
        >
            {/* Course color */}
            <Box
                bgColor="teal.500"
                borderRadius={"lg"}
                height="28px"
                width="36px"
                mr={3}
            ></Box>
            <Box>
                <Text fontWeight="bold">{courseCode}</Text>
                <Text>{courseName}</Text>
            </Box>
        </Flex>
    );
};

export default CourseInfo;
