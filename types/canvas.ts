export type CanvasQuizSubmissionQuestion = {
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
    //isFlagged: boolean;// actuall flagging
    //annotations : string[];
};
export type annotations = {
    annotationID: number;
    annotation: string;
};
export type QuizSubmissionQuestion = CanvasQuizSubmissionQuestion & {
    annotations: annotations[];
    isFlagged: boolean;
};
export type Answer = {
    id: number;
    text: string;
    html: string;
};

export interface CanvasQuizSubmission {
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

    quiz_points_possible: number;
}

// A singular quiz attempt
export type QuizAttempt = {
    submission: CanvasQuizSubmission;
    questions: QuizSubmissionQuestion[];
    selectedOptions: QuizResponse;
    quizName: string;
    course: string;
    userUid: string;
};

export type QuizSettings = {
    // semester
    semester: 1 | 2 | 3 | 4;
    academicYear: number; // 2022-2023 --> 2022, 2023-2024 --> 2024

    // pinned
    isPinned: boolean;
};

export type Quiz = {
    submissions: CanvasQuizSubmission[];
    questions: QuizSubmissionQuestion[];
    selectedOptions: QuizResponse[];

    // TODO: change this later
    quizName: string;
    course: string;
    userUid: string;
    lastUpdated: Date;

    quizInfo: CanvasQuiz;

    quizSettings: QuizSettings;
};

export type QuizResponse = {
    [assessment_question_id: number]: QuestionResponse;
};

export type QuestionResponse = {
    selected_answer_ids?: number[]; // for multiple answer / mcq
    answer_text?: string[]; // for text input questions
    correct_answer_text?: string[]; // for text input
    correct_answer_ids?: number[]; // for multiple answer / mcq
    total_score?: number;
    your_score?: number;
};

export type CanvasQuiz = {
    // the ID of the quiz
    id: number;
    // the title of the quiz
    title: string;
    // the HTTP/HTTPS URL to the quiz
    html_url: string;
    // a url suitable for loading the quiz in a mobile webview.  it will persiste
    // the headless session and, for quizzes in public courses, will force the user
    // to login
    mobile_url: string;
    // A url that can be visited in the browser with a POST request to preview a
    // quiz as the teacher. Only present when the user may grade
    preview_url: string;
    // the description of the quiz
    description: string;
    // type of quiz possible values: 'practice_quiz', 'assignment', 'graded_survey',
    // 'survey'
    quiz_type: "practice_quiz" | "assignment" | "graded_survey";
    // the ID of the quiz's assignment group:
    assignment_group_id: number;
    // quiz time limit in minutes
    time_limit: number;
    // shuffle answers for students?
    shuffle_answers: boolean;
    // let students see their quiz responses? possible values: null, 'always',
    // 'until_after_last_attempt'
    hide_results: null | "always" | "until_after_last_attempt";
    // show which answers were correct when results are shown? only valid if
    // hide_results=null
    show_correct_answers: boolean;
    // restrict the show_correct_answers option above to apply only to the last
    // submitted attempt of a quiz that allows multiple attempts. only valid if
    // show_correct_answers=true and allowed_attempts > 1
    show_correct_answers_last_attempt: boolean;
    // when should the correct answers be visible by students? only valid if
    // show_correct_answers=true
    // is a date string new Date().toString()
    show_correct_answers_at: string;
    // prevent the students from seeing correct answers after the specified date has
    // passed. only valid if show_correct_answers=true
    hide_correct_answers_at: string;
    // prevent the students from seeing their results more than once (right after
    // they submit the quiz)
    one_time_results: boolean;
    // which quiz score to keep (only if allowed_attempts != 1) possible values:
    // 'keep_highest', 'keep_latest'
    scoring_policy: "keep_highest" | "keep_latest";
    // how many times a student can take the quiz -1 = unlimited attempts
    allowed_attempts: number;
    // show one question at a time?
    one_question_at_a_time: boolean;
    // the number of questions in the quiz
    question_count: number;
    // The total point value given to the quiz
    points_possible: number;
    // lock questions after answering? only valid if one_question_at_a_time=true
    cant_go_back: boolean;
    // access code to restrict quiz access
    access_code: string;
    // IP address or range that quiz access is limited to
    ip_filter: string;
    // when the quiz is due
    // date string
    due_at: null | string;
    // when to lock the quiz
    lock_at: null | string;
    // when to unlock the quiz
    unlock_at: null | string;
    // whether the quiz has a published or unpublished draft state.
    published: boolean;
    // Whether the assignment's 'published' state can be changed to false. Will be
    // false if there are student submissions for the quiz.
    unpublishable: boolean;
    // Whether or not this is locked for the user.
    locked_for_user: boolean;
    // (Optional) Information for the user about the lock. Present when
    // locked_for_user is true.
    lock_info: null | string;
    // (Optional) An explanation of why this is locked for the user. Present when
    // locked_for_user is true.
    lock_explanation: string;
    // Link to Speed Grader for this quiz. Will not be present if quiz is
    // unpublished
    speedgrader_url: string;
    // Link to endpoint to send extensions for this quiz.
    quiz_extensions_url: string;
    // Permissions the user has for the quiz
    permissions: null | {
        // whether the user can view the quiz
        read: boolean;
        // whether the user may submit a submission for the quiz
        submit: boolean;
        // whether the user may create a new quiz
        create: boolean;
        // whether the user may edit, update, or delete the quiz
        manage: boolean;
        // whether the user may view quiz statistics for this quiz
        read_statistics: boolean;
        // whether the user may review grades for all quiz submissions for this quiz
        review_grades: boolean;
        // whether the user may update the quiz
        update: boolean;
    };
    // list of due dates for the quiz
    all_dates: null | string;
    // Current version number of the quiz
    version_number: number;
    // List of question types in the quiz
    question_types: string[];
    // Whether survey submissions will be kept anonymous (only applicable to
    // 'graded_survey', 'survey' quiz types)
    anonymous_submissions: boolean;
};

export type Course = {
    // the unique identifier for the course
    id: number;
    // the SIS identifier for the course, if defined. This field is only included if
    // the user has permission to view SIS information.
    sis_course_id: null | number;
    // the UUID of the course
    uuid: string;
    // the integration identifier for the course, if defined. This field is only
    // included if the user has permission to view SIS information.
    integration_id: null | string;
    // the unique identifier for the SIS import. This field is only included if the
    // user has permission to manage SIS information.
    sis_import_id: number | null;
    // the full name of the course. If the requesting user has set a nickname for
    // the course, the nickname will be shown here.
    name: string;
    // the course code
    course_code: string;
    // the actual course name. This field is returned only if the requesting user
    // has set a nickname for the course.
    original_name: string;
    // the current state of the course one of 'unpublished', 'available',
    // 'completed', or 'deleted'
    workflow_state: "unpublished" | "available" | "completed" | "deleted";
    // the account associated with the course
    account_id: number;
    // the root account associated with the course
    root_account_id: number;
    // the enrollment term associated with the course
    enrollment_term_id: number;
    // A list of grading periods associated with the course
    grading_periods: null | string;
    // the grading standard associated with the course
    grading_standard_id: number;
    // the grade_passback_setting set on the course
    grade_passback_setting: string;
    // the date the course was created.
    created_at: string;
    // the start date for the course, if applicable
    start_at: string;
    // the end date for the course, if applicable
    end_at: string;
    // the course-set locale, if applicable
    locale: string;
    // A list of enrollments linking the current user to the course. for student
    // enrollments, grading information may be included if include[]=total_scores
    enrollments: null;
    // optional: the total number of active and invited students in the course
    total_students?: number;
    // course calendar
    calendar: null | string;
    // the type of page that users will see when they first visit the course -
    // 'feed': Recent Activity Dashboard - 'wiki': Wiki Front Page - 'modules':
    // Course Modules/Sections Page - 'assignments': Course Assignments List -
    // 'syllabus': Course Syllabus Page other types may be added in the future
    default_view: string;
    // optional: user-generated HTML for the course syllabus
    syllabus_body?: string;
    // optional: the number of submissions needing grading returned only if the
    // current user has grading rights and include[]=needs_grading_count
    needs_grading_count?: number;
    // optional: the enrollment term object for the course returned only if
    // include[]=term
    term?: null | string;
    // optional: information on progress through the course returned only if
    // include[]=course_progress
    course_progress?: null | string;
    // weight final grade based on assignment group percentages
    apply_assignment_group_weights: boolean;
    // optional: the permissions the user has for the course. returned only for a
    // single course and include[]=permissions
    permissions?: {
        create_discussion_topic: boolean;
        create_announcement: boolean;
    };
    is_public: boolean;
    is_public_to_auth_users: boolean;
    public_syllabus: boolean;
    public_syllabus_to_auth: boolean;
    // optional: the public description of the course
    public_description?: string;
    storage_quota_mb: number;
    storage_quota_used_mb: number;
    hide_final_grades: boolean;
    license: string;
    allow_student_assignment_edits: boolean;
    allow_wiki_comments: boolean;
    allow_student_forum_attachments: boolean;
    open_enrollment: boolean;
    self_enrollment: boolean;
    restrict_enrollments_to_course_dates: boolean;
    course_format: string;
    // optional: this will be true if this user is currently prevented from viewing
    // the course because of date restriction settings
    access_restricted_by_date?: boolean;
    // The course's IANA time zone name.
    time_zone: string;
    // optional: whether the course is set as a Blueprint Course (blueprint fields
    // require the Blueprint Courses feature)
    blueprint?: boolean;
    // optional: Set of restrictions applied to all locked course objects
    blueprint_restrictions?: {
        content: boolean;
        points: boolean;
        due_dates: boolean;
        availability_dates: boolean;
    };
    // optional: Sets of restrictions differentiated by object type applied to
    // locked course objects
    blueprint_restrictions_by_object_type?: {
        assignment: { content: boolean; points: boolean };
        wiki_page: { content: boolean };
    };
    // optional: whether the course is set as a template (requires the Course
    // Templates feature)
    template?: boolean;
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
