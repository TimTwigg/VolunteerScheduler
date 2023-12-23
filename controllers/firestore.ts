import { query, collection, getDocs, addDoc, where, setDoc, doc } from "firebase/firestore";
import { db } from "@/controllers/firebase";
import VSUser from "@/models/user.ts";

async function getUserDocRef(uid: string) {
    let d = await getUserDoc(uid);
    if (d != null) return d.ref;
    else return null;
}

async function getUserDoc(uid: string) {
    let q = query(collection(db, "users"), where("uid", "==", uid));
    const res = await getDocs(q);
    if (res.size != 1) {
        return null;
    }
    return res.docs[0];
}

export async function getUserData(uid: string) {
    let d = await getUserDoc(uid);
    if (d == null) return null;
    let data = d.data();
    return new VSUser(uid, data.sheetLink);
}

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

export async function updateLink(uid: string, link: string) {
    let docRef = await getUserDocRef(uid);
    if (docRef != null) {
        setDoc(docRef, {
            sheetLink: link
        }, { merge: true });
    }
}