import type { Metadata } from "next";
import NavBar from "@/components/navbar";
import { getAuthenticatedAppForUser } from "@/controllers/firebase";
import "@/styles/main.scss";

export const metadata: Metadata = {
    title: "Volunteer Scheduler"
}

// eslint-disable-next-line @next/next/no-async-client-component
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
