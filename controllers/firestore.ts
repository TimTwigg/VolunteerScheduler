import { query, collection, getDocs, addDoc, where, setDoc, doc } from "firebase/firestore";
import { db } from "@/controllers/firebase";

export async function addUser(uid: string, token: string) {
    let q = query(collection(db, "users"), where("uid", "==", uid));
    const res = await getDocs(q);
    if (res.size < 1) {
        await addDoc(collection(db, "users"), {
            uid: uid,
            token: token
        });
    }
    else if (res.size == 1) {
        let doc = res.docs[0].ref;
        await setDoc(doc, {
            token: token
        }, { merge: true });
    }
    else if (res.size > 1) {
        throw "this shouldn't happen";
    }
}