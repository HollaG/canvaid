import { NextResponse } from "next/server";
export async function POST(request: Request) {
    const { token } = await request.json();
    const CANVAS_URL = " https:canvas.instructure.com/api/v1/";
    try {
        fetch(CANVAS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                console.log(response);
                if (response.ok) {
                    return NextResponse.json({ success: true });
                } else {
                    return NextResponse.json({ success: false });
                }
            })
            .then((result) => {
                // Handle the result
                console.log(result);
            })
            .catch((error) => {
                // Handle any errors
                console.error(error);
            });
    } catch (e) {
        console.log(e);
    }
}
