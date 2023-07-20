import {
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
} from "@chakra-ui/react";

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
        <Stack spacing={6}>
            <FormControl id="numQns" variant="floating_perm">
                <NumberInput
                    value={numQns}
                    onChange={(_, num) =>
                        setNumQns(isNaN(num) ? undefined : num)
                    }
                    min={1}
                    max={maxQns}
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <FormLabel>Number of questions (optional)</FormLabel>
                <FormHelperText>
                    Optional. A random subset of questions from all the quizzes
                    will be chosen.
                </FormHelperText>
            </FormControl>
            <FormControl id="examLength" variant="floating_perm">
                <NumberInput
                    value={examLength}
                    onChange={(_, num) =>
                        setExamLength(isNaN(num) ? undefined : num)
                    }
                    min={0}
                >
                    <NumberInputField />
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

export default ExamSettings;
