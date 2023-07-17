// Function to format the time elapsed since and return in a human readable format
// Input: Date string (to be converted using new Date())
// Output:
// < 1 day: "x hours ago"
// < 1 week: "x days ago"
// < 1 month: "x weeks ago"

export const formatTimeElapsed = (date: Date) => {
    const timeElapsed = Math.abs(
        new Date().getTime() - new Date(date).getTime()
    );
    const minutes = Math.floor(timeElapsed / (1000 * 60));
    const days = Math.floor(timeElapsed / (1000 * 3600 * 24));
    const hours = Math.floor(timeElapsed / (1000 * 3600));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);

    if (months > 0) return `${months} month${months === 1 ? "" : "s"} ago`;
    else if (weeks > 0) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    else if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    else if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    else if (minutes > 2)
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    else return "just now";
};

export const getUploads = async (uid: string) => {
    const res = await fetch(`/api/?uid=${uid}`);

    return res.json();
};

/**
 * Generate the academic year and semester display.
 *
 * e.g. 23/24 S1
 * e.g. 24/25 ST1
 */
export const getAcademicYearAndSemester = (
    academicYear: number,
    semester: number
) => {
    if (semester === 3 || semester === 4) {
        return `${academicYear - 2000}/${academicYear - 1999} ST${
            semester - 2
        }`;
    } else {
        return `${academicYear - 2000}/${academicYear - 1999} S${semester}`;
    }
};
