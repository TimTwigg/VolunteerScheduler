import type { Metadata } from "next";
import NavBar from "@/components/navbar";
import { getAuthenticatedAppForUser } from "@/controllers/firebase";
import "@/styles/main.scss";

export const metadata: Metadata = {
    title: "Volunteer Scheduler"
}

export default async function RootLayout({ children } : { children: React.ReactNode }) {
    const { currentUser } = await getAuthenticatedAppForUser();

    return (
        <html lang = "en">
            <body>
                <NavBar initialUser = {currentUser}/>
                {children}
            </body>
        </html>
    )
}
