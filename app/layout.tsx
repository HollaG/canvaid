import Body from "@/components/Body";
import Footer from "@/components/Footer/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import { SIDEBAR_WIDTH } from "@/lib/constants";

import { Inter } from "next/font/google";
import Navbar from "../components/Navbar/Navbar";
//import { chakra } from '@chakra-ui/react'
const inter = Inter({ subsets: ["latin"] });
import { Providers } from "./providers";

export const metadata = {
    title: "Canvaid",
    description: "Your best study buddy for Canvas!",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className}>
            <body>
                <Providers>
                    {/* <Navbar /> */}
                    <Sidebar />
                    <div
                    // style={{
                    //     marginLeft: SIDEBAR_WIDTH,
                    // }}
                    >
                        <Body>{children}</Body>
                    </div>
                    {/* <Footer /> */}
                </Providers>
            </body>
        </html>
    );
}
