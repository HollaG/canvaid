import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const token = await request.json();
    const CANVAS_URL = process.env.NEXT_PUBLIC_CANVAS_URL || "";

    try {
        const CANVAS_HTTP_OPTIONS = {
            method: "GET",
            headers: new Headers({
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            }),
        };

        const res = await fetch(`${CANVAS_URL}users/self`, CANVAS_HTTP_OPTIONS);

        if (!res.ok) {
            throw new Error("Invalid token!");
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json(null, {
            status: 401,
            statusText: "Invalid Canvas API Token!",
        });
    }
}
