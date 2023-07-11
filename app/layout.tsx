import Body from "@/components/Body";
import Footer from "@/components/Footer/Footer";

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
        <html lang="en">
            <body>
                <Providers>
                    <Navbar />

                    <Body>{children}</Body>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
