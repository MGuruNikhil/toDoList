// Import the functions you need from the SDKs you need
import { initializeApp,getApps } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
// import {
//     getFirestore,
//     addDoc,
//     collection,
//     getDocs
// } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA6yK8UVIhnBsIghoi8Kpf53sPxtrt_f70",
    authDomain: "nn-project-624c7.firebaseapp.com",
    projectId: "nn-project-624c7",
    storageBucket: "nn-project-624c7.appspot.com",
    messagingSenderId: "400067319768",
    appId: "1:400067319768:web:db8e3c35a14db39f1204ad",
    measurementId: "G-3KW5EY5BC9"
};

// Initialize Firebase
// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
var app;
if (!getApps().length) {
   app = initializeApp(firebaseConfig);
}
export default app;