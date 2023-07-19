import { create } from "@/firebase/database/repositories/uploads";
import {
    Quiz,
    QuizResponse,
    CanvasQuizSubmission,
    QuizAttempt,
    Answer,
    QuestionResponse,
    QuizSubmissionQuestion,
} from "@/types/canvas";
import {
    useColorModeValue,
    Tag,
    Stack,
    Flex,
    Heading,
    Divider,
    Button,
    RadioGroup,
    Radio,
    CheckboxGroup,
    Checkbox,
    Box,
    Input,
    Text,
} from "@chakra-ui/react";

import { useRouter } from "next/router";

import { Dispatch, SetStateAction, useState } from "react";

const Exam = ({
    numQn,
    quiz,
    quizResponse,
}: {
    numQn: string;

    quiz: Quiz & { id: string };
    quizResponse: QuizResponse; // the question id :  correct answers with empty selected answers
}) => {
    const router = useRouter();
    const updatedQuestions = [...quiz.questions];
    //let updatedSelectedOptions = [...quiz.selectedOptions];
    const questionIds = Object.keys(quizResponse);
    // get all the highest SelectedOptions
    if (quiz.questions.length > parseInt(numQn)) {
        let difference = quiz.questions.length - parseInt(numQn);
        // Remove random elements from the copied array
        for (let i = 0; i < difference; i++) {
            const randomIndex = Math.floor(Math.random() * questionIds.length);
            const removedQnID = questionIds.splice(randomIndex, 1)[0];
            delete quizResponse[parseInt(removedQnID)];
        }
    }
    let minSubmissionAttempt = -11;
    for (let i = 0; i < quiz.submissions.length; i++) {
        if (quiz.submissions[i].attempt <= minSubmissionAttempt) {
            minSubmissionAttempt = quiz.submissions[i].attempt;
        }
    }
    minSubmissionAttempt = minSubmissionAttempt - 1;
    const newSubmission: CanvasQuizSubmission = {
        id: minSubmissionAttempt,
        // The ID of the Quiz the quiz submission belongs to.
        quiz_id: parseInt(quiz.id),
        // The ID of the Student that made the quiz submission.
        user_id: parseInt(quiz.userUid),
        // The ID of the Submission the quiz submission represents.
        submission_id: minSubmissionAttempt,
        // The time at which the student started the quiz submission.
        started_at: "",
        // The time at which the student submitted the quiz submission.
        finished_at: "",
        // The time at which the quiz submission will be overdue, and be flagged as a
        // late submission.
        end_at: "",
        // For quizzes that allow multiple attempts, this field specifies the quiz
        // submission attempt number.
        attempt: minSubmissionAttempt,
        // Number of times the student was allowed to re-take the quiz over the
        // multiple-attempt limit.
        extra_attempts: 0,
        // Amount of extra time allowed for the quiz submission, in minutes.
        extra_time: 0,
        // The student can take the quiz even if it's locked for everyone else
        manually_unlocked: true,
        // Amount of time spent, in seconds.
        time_spent: 0,
        // The score of the quiz submission, if graded.
        score: -1,
        // The original score of the quiz submission prior to any re-grading.
        score_before_regrade: -1,
        // For quizzes that allow multiple attempts, this is the score that will be
        // used, which might be the score of the latest, or the highest, quiz
        // submission.
        kept_score: -1,
        // Number of points the quiz submission's score was fudged by.
        fudge_points: -1,
        // Whether the student has viewed their results to the quiz.
        has_seen_results: false,
        // The current state of the quiz submission. Possible values:
        // ['untaken'|'pending_review'|'complete'|'settings_only'|'preview'].
        workflow_state: "untaken",
        // Indicates whether the quiz submission is overdue and needs submission
        overdue_and_needs_submission: false,

        quiz_points_possible: questionIds.length,
    };
    // quiz.submissions.push(newSubmission);
    // no need to change the question order here
    // for (let i = 0; i < updatedQuestions.length; i++) {
    //     updatedQuestions[i].position = i + 1;
    // }
    // new quiz attempt object
    const newQuizAttempt: QuizAttempt & { id: string } = {
        ...quiz,
        submission: newSubmission,
        selectedOptions: quizResponse,
    };
    // const updatedQuiz = create(newQuizAttempt, quiz.quizInfo);
    const qns = quiz.questions.filter((qn) =>
        questionIds.includes(qn.id.toString())
    );

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const questionBgColor = useColorModeValue("white", "gray.800");
    return (
        <>
            <Box mr={2} mb={2}>
                <Tag colorScheme={"teal"}>
                    Total questions: {questionIds.length}
                </Tag>
            </Box>
            <Box
                dangerouslySetInnerHTML={{
                    __html: quiz.quizInfo.description,
                }}
            />
            {/* <Grid
                gridTemplateColumns={{
                    base: "1fr",
                    md: "200px 1fr",
                }}
            >
                <GridItem p={5}> */}
            <Stack>
                <Flex justifyContent={"space-between"} alignItems="center">
                    <Heading fontSize="xl">
                        Attempt #{(newSubmission.attempt + 10) * -1}
                    </Heading>
                    <Flex></Flex>
                </Flex>
                <Stack spacing="10">
                    {qns.map((question, i) => (
                        <Stack
                            key={i}
                            alignItems="stretch"
                            borderWidth="1px"
                            borderRadius="md"
                            padding="4"
                            bgColor={questionBgColor}
                        >
                            <Heading
                                fontSize="lg"
                                alignItems={"center"}
                                display="flex"
                                justifyContent={"space-between"}
                            >
                                <div> Question {i + 1} </div>
                            </Heading>
                            <div
                                className="question-text"
                                dangerouslySetInnerHTML={{
                                    __html: question.question_text,
                                }}
                            />
                            <Divider />
                            {/* <ExamAnswerList // this is the correct answer
                                // questionType={question.question_type}
                                // answers={question.answers}
                                selectedOptions={quizResponse[question.id]}
                                
                            /> */}
                            {/* <Box mt={3}>
                                         <AnswerList
                                            questionType={
                                                question.question_type
                                            }
                                            answers={question.answers}
                                            selectedOptions={quizResponse}
                                            show_correct_answers={
                                                quiz.quizInfo
                                                    .show_correct_answers
                                            }
                                        /> *
                                    </Box> */}
                        </Stack>
                    ))}
                </Stack>
                <Button
                    onClick={() => {
                        // TODO : calculate total marks
                        // create(newQuizAttempt, quiz.quizInfo);
                        // setIsExamMode(false);
                        // router.refresh();
                    }}
                    colorScheme="teal"
                >
                    Submit Quiz
                </Button>
            </Stack>
            {/* </GridItem>
            </Grid> */}
        </>
    );
};
// const endExam = (quizReponse: QuizResponse, setIsExamMode:Dispatch<SetStateAction<boolean>>) => {
//     individualExamUpdate(quizReponse);
//         setIsExamMode(false);
//         // update the quiz attempt
//         // update the quiz

// }

export default Exam;
export const ExamAnswerList = ({
    // questionType,
    // answers,
    selectedOptions,
    setSelectedOptions,
    question,
}: {
    question: QuizSubmissionQuestion;
    selectedOptions: QuizResponse; // a single question
    setSelectedOptions: Dispatch<SetStateAction<QuizResponse>>;
}) => {
    const questionType = question.question_type;
    const answers = question.answers;
    const questionId = question.id;
    switch (questionType) {
        case "multiple_choice_question":
        case "true_false_question":
            return (
                <RadioGroup
                    value={(
                        selectedOptions[questionId]?.selected_answer_ids?.[0] ??
                        ""
                    ).toString()}
                    onChange={(value) => {
                        // value is a single
                        // setSelectedAnswer(value);
                        // selectedOptions.selected_answer_ids = [
                        //     parseInt(selectedAnswer),
                        // ];

                        setSelectedOptions((prev) => {
                            return {
                                ...prev,
                                [questionId]: {
                                    selected_answer_ids: [parseInt(value)],
                                },
                            };
                        });
                    }}
                >
                    <Stack>
                        {answers.map((answer, i) => (
                            <Flex alignItems="center" key={i}>
                                <Box width="100px" textAlign="end" mr={3}></Box>
                                <Radio key={i} value={answer.id.toString()}>
                                    {answer.text ?? answer.html}
                                </Radio>
                            </Flex>
                        ))}
                    </Stack>
                </RadioGroup>
            );

        case "multiple_answers_question":
            return (
                <CheckboxGroup
                    value={selectedOptions[
                        questionId
                    ]?.selected_answer_ids?.map((id) => id.toString())}
                    onChange={(e) => {
                        // setSelectedAnswers(e.map((e) => e));
                        // selectedOptions.selected_answer_ids =
                        //     selectedAnswers.map((id) =>
                        //         parseInt(id.toString())
                        //     );
                        //console.log("selectedAns" + selectedAnswers);
                        setSelectedOptions((prev) => ({
                            ...prev,
                            [questionId]: {
                                selected_answer_ids: e.map((id) =>
                                    parseInt(id.toString())
                                ),
                            },
                        }));
                    }}
                >
                    <Stack spacing={4}>
                        {answers.map((answer, i) => (
                            <Flex alignItems="center" key={i}>
                                <Box width="100px" textAlign="end" mr={3}></Box>
                                <Checkbox key={i} value={answer.id.toString()}>
                                    {answer.text ?? answer.html}
                                </Checkbox>
                            </Flex>
                        ))}
                    </Stack>
                </CheckboxGroup>
            );

        case "essay_question":
        case "short_answer_question":
        case "numerical_question":
            return (
                <Stack spacing={4}>
                    <Flex alignItems="center">
                        <Box width="100px" textAlign="end" mr={3}></Box>
                        <Box>
                            <Stack spacing={1}>
                                <Text
                                    fontWeight="semibold"
                                    textDecoration="underline"
                                >
                                    Your answer
                                </Text>
                                <Input
                                    placeholder="Insert Answer Here"
                                    value={
                                        selectedOptions[questionId]
                                            ?.answer_text?.[0] ?? ""
                                    }
                                    onChange={(e) => {
                                        setSelectedOptions((prev) => ({
                                            ...prev,
                                            [questionId]: {
                                                answer_text: [e.target.value],
                                            },
                                        }));
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Flex>
                </Stack>
            );

        default:
            return <>--- UNSUPPORTED QUESTION TYPE ---</>;
    }
};
