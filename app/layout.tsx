import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "@/components/navbar";
import { getAuthenticatedAppForUser } from "@/controllers/firebase";
import "@/styles/main.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Volunteer Scheduler"
}

// eslint-disable-next-line @next/next/no-async-client-component
export default async function RootLayout({ children } : { children: React.ReactNode }) {
    const { currentUser } = await getAuthenticatedAppForUser();

    return (
        <html lang = "en">
            <body className = {inter.className}>
                <NavBar initialUser = {currentUser}/>
                {children}
            </body>
        </html>
    )
}
