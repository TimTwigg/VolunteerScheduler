import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged as _onAuthStateChanged } from "firebase/auth";
import { auth } from "@/controllers/firebase";
import { addUser } from "@/controllers/firestore";

export function onAuthStateChanged(cb: any) {
    return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider).then(async (res) => {
        let cred = GoogleAuthProvider.credentialFromResult(res);
        let token = cred?.accessToken;
        let user = res.user;
        await addUser(user.uid, token!);
        console.log("success");
        return user;
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`Sign in error: ${errorCode}, ${errorMessage}`);
        return null;
    });
    return cred;
}

export async function signOut() {
    auth.signOut().catch((error) => {
        console.log(`Sign out error: ${error}`);
    });
}