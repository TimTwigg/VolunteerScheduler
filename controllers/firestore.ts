import { query, collection, getDocs, addDoc, where, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/controllers/firebase";
import VSUser, { Matchings } from "@/models/user";
import { Schedule, scheduleConverter } from "@/models/schedule";

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

export async function getUserData(uid: string): Promise<VSUser|null> {
    let d = await getUserDoc(uid);
    if (d == null) return null;
    let data = d.data();
    return new VSUser(uid, data.sheetLink, {
        NameField: data.NameField,
        WeekendsServingField: data.WeekendsServingField,
        ServeTimesField: data.ServeTimesField,
        ServiceTimeField: data.ServiceTimeField,
        TeamsField: data.TeamsField,
        NotesField: data.NotesField
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

export async function updateUserSettings(uid: string, link: string, matchings: Matchings): Promise<boolean> {
    let docRef = await getUserDocRef(uid);
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

export async function saveSchedule(uid: string, schedules: Schedule[]) {
    let docRef = await getUserDocRef(uid).then(ref => ref?.withConverter(scheduleConverter));
    if (docRef== null) return;
    setDoc(docRef, schedules, { merge: true });
}

export async function loadSchedule(uid: string): Promise<Schedule[]> {
    let docRef = await getUserDocRef(uid).then(ref => ref?.withConverter(scheduleConverter));
    if (docRef == null) return [];
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return [];
}

export async function saveManualAssignments(uid: string, assignments: string[]) {
    let docRef = await getUserDocRef(uid);
    if (docRef== null) return;
    setDoc(docRef, { manualAssignments: assignments }, { merge: true })
}

export async function loadManualAssignments(uid: string): Promise<string[]> {
    let d = await getUserDoc(uid);
    if (d == null) return [];
    let data = d.data();
    let manAssigns = data.manualAssignments;
    if (manAssigns) return manAssigns;
    return [];
}