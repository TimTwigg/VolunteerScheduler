import { firestore } from "./firebaseSetup"

const docRef = firestore.collection("users").doc("test")

export const handleAddData = async () => {
    await docRef.set({
        first: "Ada",
        last: "Lovelace",
        born: 1815,
        link: "no-link.html"
    });
}
