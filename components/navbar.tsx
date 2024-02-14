"use client";
import React from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signOut, onAuthStateChanged } from "@/controllers/auth";
import { getUserOrgName } from "@/controllers/firestore";

export default function NavBar({ initialUser }: {initialUser: User|null}) {
    const [user, SetUser] = React.useState<User|null>(initialUser);
    const router = useRouter();
    const [orgName, SetOrgName] = React.useState<String>("Volunteer Scheduler");

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
            if (user) getUserOrgName(user.email!).then(name => SetOrgName(name||"Volunteer Scheduler")).catch(() => {});
        });
    }, [user, router]);

    const handleSignIn = async (event: any) => {
        event.preventDefault();
        SetUser(await signInWithGoogle());
    }
    const handleSignout = (event: any) => {
        event.preventDefault();
        signOut();
        window.location.reload();
    }

    return (
        <nav>
            <h3 className = "eight columns">{orgName}</h3>
            {!user && <a className = "loginButton" href = "/api/auth/signin" onClick = {handleSignIn}>Sign In</a>}
            {user && (<>
                <div className = "dropdown">
                    <button className = "dropbtn">{user.displayName}</button>
                    <div className = "dropdown-content">
                        <a href = "/api/auth/signout" onClick = {handleSignout}>Sign Out</a>
                    </div>
                </div>
            </>)}
        </nav>
    );
}