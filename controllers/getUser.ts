"use client";
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "@/controllers/auth";

export function getUser() {
    const [user, SetUser] = React.useState<User|null>();
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

    return user;
}