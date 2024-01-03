import { query, collection, getDocs, addDoc, where, setDoc, doc } from "firebase/firestore";
import { db } from "@/controllers/firebase";
import VSUser, { Matchings } from "@/models/user.ts";

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
    return new VSUser(uid, data.sheetLink, {
        NameField: data.NameField,
        WeekendsServingField: data.WeekendsServingField,
        ServeTimesField: data.ServeTimesField,
        ServiceTimeField: data.ServiceTimeField
    });
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

export async function updateUserSettings(uid: string, link: string, matchings: Matchings) {
    let docRef = await getUserDocRef(uid);
    console.log(docRef);
    let data = {
        sheetLink: link,
        ...matchings
    }
    if (docRef != null) {
        setDoc(docRef, data, { merge: true });
        return true;
    }
    return false;
}