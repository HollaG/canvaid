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

const CHAKRA_COLORS = [
    "red.700",
    "teal.300",
    "cyan.700",
    "orange.300",
    "yellow.700",
    "blue.300",
    "purple.700",
    "pink.300",
    "green.700",
    "red.300",
    "teal.700",
    "cyan.300",
    "orange.700",
    "yellow.300",
    "blue.700",
    "purple.300",
    "pink.700",
    "green.300",
];

const COLORS = [
    "#9B2C2C",
    "#4FD1C5",
    "#0987A0",
    "#F6AD55",
    "#975A16",
    "#63B3ED",
    "#553C9A",
    "#F687B3",
    "#276749",
    "#FC8181",
    "#285E61",
    "#76E4F7",
    "#9C4221",
    "#F6E05E",
    "#2C5282",
    "#B794F4",
    "#97266D",
    "#68D391",
];

/**
 * Get a random color.
 */
export const getRandomColor = () => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
};
