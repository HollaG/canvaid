export interface AppUser {
    displayName: string;
    email: string;
    photoURL: string;
    uid: string;
    uploadedIds: string[]; // an array of uuids in uploads that belongs to this user
    canvasApiToken: string;

    courseColors: { [courseCode: string]: string };
    accessibility?: boolean;
}
