import app from "./firebaseconfig.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
var userId = null;
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = "toDoList.html";
    }
    else {
        //nothing to do
    }
});
const provider = new GoogleAuthProvider(app);
auth.languageCode = 'en';
const signUp = document.querySelector('#signup');
signUp.addEventListener('click', createUser);
var display = document.getElementById('result');
function createUser() {
    const mail = document.getElementById('email');
    const email = mail.value;
    const pWord = document.getElementById('password');
    const password = pWord.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("User Created successfully");
            sendEmailVerification(auth.currentUser)
                .then(() => {
                    alert("Email verification link sent, verify your email before logging in");
                    mail.value="";
                    pWord.value="";
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            display.innerHTML = "something went wrong";
            console.log(errorCode);
            console.log(errorMessage);
        });
}
const login = document.querySelector('#login');
login.addEventListener('click', userLogin);
function userLogin() {
    const mail = document.getElementById('email');
    const email = mail.value;
    const pWord = document.getElementById('password');
    const password = pWord.value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if(user.emailVerified) {
                window.location.href = `toDoList.html`;
            }
            else {
                alert("Please complete email verification, verification link already sent to ", user.email);
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            display.innerHTML = "Something went wrong";
            console.log(errorCode);
            console.log(errorMessage);
        });
}
const googleSignIn = document.querySelector('#google');
googleSignIn.addEventListener('click', handelGoogle);
function handelGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            userId = user.uid;
            console.log(user);
            window.location.href = `toDoList.html`;
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            // The email of the user's account used.
            const email = error.customData.email;
            console.log(email);
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log(credential);
            display.innerHTML = "Something went wrong";
        });
}

const forgotPassword = document.getElementById("forgotPassword");
forgotPassword.addEventListener('click',()=>{
    const email = prompt("Enter your registred email id");
    sendPasswordResetEmail(auth, email)
    .then(() => {
        alert("Password reset mail is sent");
    })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
  });
});