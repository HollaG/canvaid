import firebase_app from "@/firebase/config";
import { getAttempts } from "@/firebase/database/repositories/uploads";
import { getUser } from "@/firebase/database/repositories/users";

import { getAuth } from "firebase/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // get the user's uid from the GET request
    const uid = req.nextUrl.searchParams.get("uid");

    if (!uid) {
        return NextResponse.json({ data: null });
    }

    // check if the user exists
    const user = await getUser(uid);

    if (!user) {
        return NextResponse.json({ data: null });
    }

    console.log("found user", user);

    // get this user's attempts
    const quizAttempts = await getAttempts(uid);
    return NextResponse.json({ data: quizAttempts });
}
