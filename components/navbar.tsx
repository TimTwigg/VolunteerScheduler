"use client";
import React from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signOut, onAuthStateChanged } from "@/controllers/auth";

export default function NavBar({ initialUser }: {initialUser: User|null}) {
    const [user, SetUser] = React.useState<User|null>(initialUser);
    const router = useRouter();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged((authUser: any) => SetUser(authUser));
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        onAuthStateChanged((authUser: any) => {
            if (user == undefined) return;
            if (user?.email != authUser?.email) {
                router.refresh();
            }
        });
    }, [user, router]);

    const handleSignIn = async (event: any) => {
        event.preventDefault();
        SetUser(await signInWithGoogle());
    }
    const handleSignout = (event: any) => {
        event.preventDefault();
        signOut();
    }

    return (
        <nav>
            <h3>Volunteer Scheduler</h3>
            <p>
                {!user && (<>
                    <span className = "notSignedInText">
                        You are not signed in
                    </span>
                    <a href = "/api/auth/signin" onClick = {handleSignIn}>
                        Sign In
                    </a>
                </>)}
                {user && (<>
                    <span className = "signedInText">
                        Signed in as {user.displayName}
                    </span> 
                    <a href = "/api/auth/signout" onClick = {handleSignout}>
                        Sign out
                    </a>
                </>)}
            </p>
        </nav>
    );
}