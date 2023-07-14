import { NextResponse } from "next/server";
export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        if (token == null || token == "") {
            return NextResponse.json({ success: false });
        }
        const apiUrl = "https://canvas.instructure.com/api/v1/users/self";

        fetch(apiUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
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
