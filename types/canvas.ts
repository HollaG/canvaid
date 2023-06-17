export type QuizSubmissionQuestion = {
    // The ID of the quiz question.
    id: number; // NOTE: WE USE THIS ID
    // The ID of the Quiz the question belongs to.
    quiz_id: number;

    quiz_group_id: number;
    assessment_question_id: number; // NEVER EVER USE THIS ONEEEEEEE

    // The order in which the question will be retrieved and displayed.
    position: number;
    // The name of the question.
    question_name: string;
    // The type of the question.
    question_type: string;
    // The text of the question.
    question_text: string;

    variables: any;
    formulas: any;
    answer_tolerance: any;
    formula_decimal_places: any;
    matches: any;
    flagged: boolean;
    correct: boolean;

    // The maximum amount of points possible received for getting this question
    // correct.
    // points_possible: number;
    // // The comments to display if the student answers the question correctly.
    // correct_comments: string;
    // // The comments to display if the student answers incorrectly.
    // incorrect_comments: string;
    // // The comments to display regardless of how the student answered.
    // neutral_comments: string;
    // An array of available answers to display to the student.
    answers: Answer[];
};

export type Answer = {
    id: number;
    text: string;
    html: string;
};

export interface QuizSubmission {
    // The ID of the quiz submission.
    id: number;
    // The ID of the Quiz the quiz submission belongs to.
    quiz_id: number;
    // The ID of the Student that made the quiz submission.
    user_id: number;
    // The ID of the Submission the quiz submission represents.
    submission_id: number;
    // The time at which the student started the quiz submission.
    started_at: string;
    // The time at which the student submitted the quiz submission.
    finished_at: string;
    // The time at which the quiz submission will be overdue, and be flagged as a
    // late submission.
    end_at: string;
    // For quizzes that allow multiple attempts, this field specifies the quiz
    // submission attempt number.
    attempt: number;
    // Number of times the student was allowed to re-take the quiz over the
    // multiple-attempt limit.
    extra_attempts: number;
    // Amount of extra time allowed for the quiz submission, in minutes.
    extra_time: number;
    // The student can take the quiz even if it's locked for everyone else
    manually_unlocked: boolean;
    // Amount of time spent, in seconds.
    time_spent: number;
    // The score of the quiz submission, if graded.
    score: number;
    // The original score of the quiz submission prior to any re-grading.
    score_before_regrade: number;
    // For quizzes that allow multiple attempts, this is the score that will be
    // used, which might be the score of the latest, or the highest, quiz
    // submission.
    kept_score: number;
    // Number of points the quiz submission's score was fudged by.
    fudge_points: number;
    // Whether the student has viewed their results to the quiz.
    has_seen_results: boolean;
    // The current state of the quiz submission. Possible values:
    // ['untaken'|'pending_review'|'complete'|'settings_only'|'preview'].
    workflow_state:
        | "untaken"
        | "pending_review"
        | "complete"
        | "settings_only"
        | "preview";
    // Indicates whether the quiz submission is overdue and needs submission
    overdue_and_needs_submission: boolean;
}

export type QuizAttempt = {
    submission: QuizSubmission[];
    questions: QuizSubmissionQuestion[];
    selectedOptions: QuizResponse;

    // TODO: change this later
    quizName: string;
    course: string;
    userUid: string;
};

export type QuizResponse = {
    [assessment_question_id: number]: QuestionResponse;
};

export type QuestionResponse = {
    selected_answer_ids?: number[]; // for multiple answer / mcq
    answer_text?: string; // for text input questions
    correct_answer_text?: string; // for text input
    correct_answer_ids?: number[]; // for multiple answer / mcq
    total_score?: number;
    your_score?: number;
};

// [{
//     "questionNum": 1,
//     "questionText": "What is the capital of France?",
//     "questionType": "multipleChoice",
//     "options": [{
//         id: 1,
//         text: "Paris",
//         html: "<p>Paris</p>",
//         correct: true
//     }]
// }]
