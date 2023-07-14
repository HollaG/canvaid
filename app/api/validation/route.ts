import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const token = await request.json();
    const CANVAS_URL = process.env.NEXT_PUBLIC_CANVAS_URL || "";

    console.log(`${CANVAS_URL}users/self`);
    console.log(token);
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
    // fetch(`${CANVAS_URL}users/self`, {
    //     method: "GET",
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //     },
    // })
    //     .then((response) => {
    //         NextResponse.json({ success: true });
    //         if (response.ok) {
    //             console.log("Token is OK");
    //             NextResponse.json({ success: true });
    //         } else {
    //             console.log("Invalid token!");
    //             NextResponse.json({ success: true });
    //         }
    //     })

    //     .catch((error) => {
    //         // Handle any errors
    //         console.error(error);
    //         NextResponse.json(null, {
    //             status: 401,
    //             statusText: "Invalid Canvas API Token!",
    //         });
    //     });
}
