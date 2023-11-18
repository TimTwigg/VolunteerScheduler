import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
    apiKey: "AIzaSyBI95-SU3VJi0DJM6USjPzTzDlmw0LzCww",
    authDomain: "volunteerscheduler-400418.firebaseapp.com",
    projectId: "volunteerscheduler-400418",
    storageBucket: "volunteerscheduler-400418.appspot.com",
    messagingSenderId: "3710179502",
    appId: "1:3710179502:web:9185e79515a7809467b53f",
    measurementId: "G-1X0KFKEBR2"
}

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app)