"use client";
import { getUser } from "@/controllers/getUser";

export const dynamic = "force-dynamic";

export default function LogIn() {
    const currentUser = getUser();

    if (currentUser === undefined || currentUser === null) {
        return (
            <>
                <p>No</p>
            </>
        );
    }

    return (
        <main>
            <p>
                Name: {currentUser?.displayName}
            </p>
        </main>
    )
}
