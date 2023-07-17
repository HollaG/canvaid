"use client";
import {
    Quiz,
    QuestionResponse,
    Answer,
    Exam,
    ExamDetails,
} from "@/types/canvas";
import { Select, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizContainer } from "../providers";
const exam = () => {
    const { quizzes, setQuizzes } = useQuizContainer();
    const router = useRouter();
    // each quiz which is made up of multiple attempts
    const selectCourse: string[] = [];
    type QuizOption = {
        id: string;
        name: string;
        course: string;
    };
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [selectedTime, setSelectedTime] = useState("0");
    const [examQuizzes, setExamQuizzes] = useState<Quiz[]>();

    const selectQuiz: QuizOption[] = [];
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedQuiz, setSelectedQuiz] = useState("");
    const filteredQuizzes = quizzes.filter((quiz) => {
        return quiz.quizInfo.show_correct_answers;
    });
    filteredQuizzes.map((quiz) => {
        // quiz.questions becomes answers
        // for each quiz, check for whether they show correct answers, if they do
        // then automatically allow it for exam mode
        // if they don't, then check for whether the user has selected the correct answer
        // or whether the correct ans is able to be found, if so then allow it into exam mode
        // if (!quiz.quizInfo.show_correct_answers) {
        //     // selected options is their input and also cross checked with canvas to see if ans is correct
        //     // by referencing the question if as well, thus check if its possible then filter the qn
        //     quiz.selectedOptions.map((selectedOption) => {});
        // }
        // quiz.questions.map((question) => {
        //     // for each question,
        // });
        // insert course name into list of courses if there's at least a single qn avaliable
        if (!selectCourse.includes(quiz.course) && quiz.questions.length != 0) {
            // might use state instead not sure
            selectCourse.push(quiz.course);
        }
        const selectQuizId = selectQuiz.map((quiz) => {
            return quiz.id;
        });
        if (!selectQuizId.includes(quiz.id) && quiz.questions.length != 0) {
            // might use state instead not sure
            selectQuiz.push({
                id: quiz.id,
                name: quiz.quizName,
                course: quiz.course,
            });
        }
    });
    const handleSubmit = (event: any) => {
        event.preventDefault();
        // make an in between webpage with the selected course and quiz and show the number of questions and to choose the time limit
        //router.push(`${selectedCourse}/${selectedQuiz}`);
        setIsSubmitted(true);
    };
    return (
        <>
            {!confirmed && (
                <>
                    {isSubmitted && <ExamMenu examQuizzes={examQuizzes} />}
                    {!isSubmitted && selectedQuiz.length == 0 && (
                        <div>
                            <h1>No quizzes avaliable</h1>
                            <Button onClick={() => router.push("../")}>
                                Go Back To Add A Quiz
                            </Button>
                        </div>
                    )}
                    {!isSubmitted && selectedQuiz.length != 0 && (
                        <form onSubmit={handleSubmit}>
                            <Select
                                placeholder="Choose courses"
                                value={selectedCourse}
                                onChange={(e) =>
                                    setSelectedCourse(e.target.value)
                                }
                            >
                                {selectCourse.map((course) => {
                                    return (
                                        <option value={course}>{course}</option>
                                    );
                                })}
                            </Select>
                            <Select
                                placeholder="Choose quizzes"
                                value={selectedQuiz}
                                onChange={(e) =>
                                    setSelectedQuiz(e.target.value)
                                }
                            >
                                <option value="0"> All Quizzes</option>
                                {selectQuiz.map((quiz) => {
                                    return (
                                        <option value={quiz.id}>
                                            {quiz.name}
                                        </option>
                                    );
                                })}
                            </Select>
                            <Select
                                placeholder="Choose time"
                                value={selectedTime}
                                onChange={(e) =>
                                    setSelectedTime(e.target.value)
                                }
                            >
                                <option value="0">No Time Limit</option>
                                <option value="5">5 minutes</option>
                                <option value="10">10 minutes</option>
                                <option value="15">15 minutes</option>
                                {/* Add more time options as needed */}
                            </Select>
                            {selectedTime !== "0" && (
                                <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={selectedTime}
                                    onChange={(e) =>
                                        setSelectedTime(e.target.value)
                                    }
                                />
                            )}
                            <Button type="submit">Start Exam</Button>
                        </form>
                    )}
                </>
            )}
            {confirmed && <ExamMode />}
        </>
    );
};

const getQuestionWithCorrectAnswer = () => {};
const AnswerResultTag = ({
    selectedOptions,
    answer,
}: {
    selectedOptions: QuestionResponse;
    answer?: Answer;
}) => {
    // for qns that aren't graded yet
    if (selectedOptions.your_score === -1) {
        return false;
    }
    // for qns that aren't multiple choice so no correct answeer as its open text
    if (!answer) {
        return false;
    }
    // if this option is correct but not selected
    if (
        selectedOptions.correct_answer_ids?.includes(answer.id) &&
        !selectedOptions.selected_answer_ids?.includes(answer.id)
    ) {
        return true;
    }

    // if this option is correct
    if (selectedOptions.correct_answer_ids?.includes(answer.id)) {
        return true;
    }

    return false;
}; // put examDetails in here
const ExamMenu = ({ examQuizzes }: { examQuizzes: any }) => {
    return <div>Exam Menu</div>;
};
const ExamMode = () => {
    return <div>Exam Mode</div>;
};
export default exam;
