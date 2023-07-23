import { Quiz } from "@/types/canvas";
import {
    Box,
    Checkbox,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    Text,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

/**
 * Generates the input fields for exam settings.
 *
 * For use in the specific quiz page.
 */
const ExamSettings = ({
    numQns,
    setNumQns,
    isRandom,
    setIsRandom,
    maxQns,
    examLength,
    setExamLength,
}: {
    numQns: number | undefined;
    setNumQns: (numQns: number | undefined) => void;
    maxQns: number | undefined;
    examLength: number | undefined;
    setExamLength: (examLength: number | undefined) => void;
    isRandom: boolean;
    setIsRandom: (isRandom: boolean) => void;
}) => {
    return (
        <Stack spacing={8}>
            <FormControl id="numQns" variant="floating_perm">
                <NumberInput
                    value={numQns}
                    onChange={(_, num) =>
                        setNumQns(isNaN(num) ? undefined : num)
                    }
                    min={1}
                    max={maxQns}
                >
                    <NumberInputField data-testid="input-numQns" />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <FormLabel>Number of questions</FormLabel>
                <FormHelperText>Questions are randomly picked.</FormHelperText>
            </FormControl>
            <FormControl id="examLength" variant="floating_perm">
                <NumberInput
                    value={examLength}
                    onChange={(_, num) =>
                        setExamLength(isNaN(num) ? undefined : num)
                    }
                    min={0}
                >
                    <NumberInputField data-testid="input-examLength" />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <FormLabel>Exam duration (minutes)</FormLabel>
                <FormHelperText>
                    Optional. A timer will be shown for you.
                </FormHelperText>
            </FormControl>
            <FormControl>
                <Checkbox
                    isChecked={isRandom}
                    onChange={(e) => setIsRandom(e.target.checked)}
                    data-testid="input-isRandom"
                >
                    Randomise question order
                </Checkbox>
                <FormHelperText>
                    Randomisation is not supported for quizzes with grouped
                    questions.
                </FormHelperText>
            </FormControl>
        </Stack>
    );
};

/**
 * For use in step 1 of creating a new exam.
 *
 * Category (course)
 * Quiz name
 *
 * Choose questions
 */
export const GeneralExamSettings1 = ({
    groupedByCourseCode,
    selectedQuizzes,
    setSelectedQuizzes,
    categoryName,
    setCategoryName,
    quizName,
    setQuizName,
}: {
    groupedByCourseCode: {
        [courseCode: string]: (Quiz & { id: string })[];
    };
    setSelectedQuizzes: Dispatch<SetStateAction<string[]>>;
    selectedQuizzes: string[];

    categoryName: string;
    setCategoryName: (categoryName: string) => void;
    quizName: string;
    setQuizName: (quizName: string) => void;
}) => {
    return (
        <Stack spacing={6}>
            <FormControl id="category" variant="floating">
                <Input
                    placeholder=" "
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />
                <FormLabel>Category</FormLabel>
                <FormHelperText>
                    {" "}
                    Helps you categorise your custom quizzes. Defaults to
                    &apos;Custom&apos;
                </FormHelperText>
            </FormControl>
            <FormControl id="quizName" variant="floating" isRequired>
                <Input
                    placeholder=" "
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    data-testid="input-quizName"
                />
                <FormLabel>Quiz name</FormLabel>
                <FormHelperText>
                    Remember your custom quiz by giving it a name.
                </FormHelperText>
            </FormControl>
            <Box>
                <Text fontWeight={"bold"} fontSize="lg" mb={3}>
                    {" "}
                    Choose your quizzes{" "}
                </Text>

                <CheckboxTree
                    groupedByCourseCode={groupedByCourseCode}
                    setSelectedQuizzes={setSelectedQuizzes}
                    selectedQuizzes={selectedQuizzes}
                />
            </Box>
        </Stack>
    );
};

/**
 * For use in step 2 of creating a new exam
 *
 * Number of questions
 * Exam duration
 * Randomise question order
 */
const GeneralExamSettings2 = () => {};

export default ExamSettings;

const CheckboxTree = ({
    groupedByCourseCode,
    selectedQuizzes,
    setSelectedQuizzes,
}: {
    groupedByCourseCode: {
        [courseCode: string]: (Quiz & { id: string })[];
    };
    setSelectedQuizzes: Dispatch<SetStateAction<string[]>>;
    selectedQuizzes: string[];
}) => {
    return (
        <>
            {Object.keys(groupedByCourseCode).map((courseCode, i) => {
                const quizzesForCourse = groupedByCourseCode[courseCode];
                const allChecked = quizzesForCourse.every((quiz) =>
                    selectedQuizzes.includes(quiz.id)
                );
                const someChecked =
                    quizzesForCourse.some((quiz) =>
                        selectedQuizzes.includes(quiz.id)
                    ) && !allChecked;
                return (
                    <Box key={i}>
                        <Checkbox
                            onChange={(e) => {
                                setSelectedQuizzes((prev) => {
                                    // if this checkbox got checked, add all the quizzes for this course
                                    if (e.target.checked) {
                                        return [
                                            ...new Set([
                                                ...prev,
                                                ...quizzesForCourse.map(
                                                    (quiz) => quiz.id
                                                ),
                                            ]),
                                        ];
                                    } else {
                                        // if this checkbox got unchecked, remove all the quizzes for this course
                                        return prev.filter(
                                            (id) =>
                                                !quizzesForCourse
                                                    .map((quiz) => quiz.id)
                                                    .includes(id)
                                        );
                                    }
                                });
                            }}
                            isIndeterminate={someChecked}
                            isChecked={allChecked}
                            fontWeight="semibold"
                        >
                            {quizzesForCourse[0].course}
                        </Checkbox>
                        <Stack pl={6} mt={1} spacing={1}>
                            {quizzesForCourse.map((quiz, j) => (
                                <Checkbox
                                    // isChecked={checkedItems[0]}
                                    // onChange={(e) =>
                                    //     setCheckedItems([
                                    //         e.target.checked,
                                    //         checkedItems[1],
                                    //     ])
                                    // }
                                    key={j}
                                    isChecked={selectedQuizzes.includes(
                                        quiz.id
                                    )}
                                    onChange={(e) => {
                                        setSelectedQuizzes((prev) => {
                                            if (e.target.checked) {
                                                return [...prev, quiz.id];
                                            } else {
                                                return prev.filter(
                                                    (id) => id !== quiz.id
                                                );
                                            }
                                        });
                                    }}
                                    data-testid="checkbox-quiz"
                                >
                                    {quiz.quizName}
                                </Checkbox>
                            ))}
                        </Stack>
                    </Box>
                );
            })}
        </>
    );
};
