import app from "./firebaseconfig.js";
import { getDatabase, ref, push, set, remove, onChildAdded, onChildChanged, onChildRemoved, update } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
const auth = getAuth(app);
const db = getDatabase(app);
var userId;
var toDoListRef;
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                toDoListRef = ref(db, "users/" + userId);
                // Render the existing list of the user
                onChildAdded(toDoListRef, (snapshot) => {
                    const newItem = snapshot.val();
                    renderToDoItem(newItem, snapshot.key);
                });
            } else {
                window.location.href = "auth.html";
            }
        });
    })
    .catch((error) => {
        console.log(error);
    });


const logOut = document.getElementById("logout");
logOut.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "auth.html";
    }).catch((error) => {
        console.log(error);
    });
});

function renderToDoItem(item, itemKey) {
    const parentList = document.getElementById('parentList');
    const newListItem = document.createElement('li');
    newListItem.classList.add("list-group-item");
    newListItem.innerHTML = `
                <h3 class="flex-grow-1">${item.text}</h3>
                <button class="btn btn-warning mx-3 edit-btn">edit</button>
                <button class="btn btn-danger delete-btn">delete</button>
            `;
    newListItem.setAttribute('data-key', itemKey);
    parentList.appendChild(newListItem);
}

function updateToDoItem(itemKey, updatedItem) {
    const listItem = document.querySelector(`li[data-key="${itemKey}"]`);
    if (listItem) {
        listItem.querySelector('h3').textContent = updatedItem.text;
    }
}

function removeToDoItem(itemKey) {
    const listItem = document.querySelector(`li[data-key="${itemKey}"]`);
    if (listItem) {
        listItem.remove();
    }
}

let cbtn = document.getElementById('add_btn');
cbtn.addEventListener('click', addChapter);
function addChapter(e) {
    let currentBtn = e.currentTarget;
    let currentInput = document.getElementById('inp');
    let currentChapter = currentInput.value;
    if (currentChapter == "") {
        alert('Empty entries are not allowed');
        return;
    }

    const newChapterKey = push(toDoListRef);
    set(newChapterKey, {
        text: currentChapter
    });
    currentInput.value = "";
    parentList.innerHTML = "";
    onChildAdded(toDoListRef, (snapshot) => {
        const newItem = snapshot.val();
        renderToDoItem(newItem, snapshot.key);
    });
}

document.getElementById('parentList').addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-btn')) {
        const newText = prompt("Enter new text");
        if (newText !== null) {
            const listItem = e.target.parentElement;
            const updatedText = newText.trim();
            if (updatedText !== "") {
                // Update the edited item in Firebase Realtime Database
                const itemKey = listItem.getAttribute('data-key');
                // const userId = auth.currentUser.uid;
                if (userId) {
                    set(ref(db, 'users/' + userId + '/' + itemKey), {
                        text: updatedText
                    })
                        .then(() => {
                            console.log("Edited successfully");
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    parentList.innerHTML = ""
                    onChildAdded(toDoListRef, (snapshot) => {
                        const newItem = snapshot.val();
                        renderToDoItem(newItem, snapshot.key);
                    });
                }
            } else {
                alert('Empty entries are not allowed');
            }
        }
    }
});

document.getElementById('parentList').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
        const listItem = e.target.parentElement;
        const itemKey = listItem.getAttribute('data-key');
        // Remove the item from Firebase Realtime Database
        if (userId) {
            remove(ref(db, 'users/' + userId + '/' + itemKey))
                .then(function () {
                    // Remove the item from the UI
                    listItem.remove();
                })
                .catch(function (error) {
                    console.error("Error removing item: ", error);
                });
            parentList.innerHTML = ""
            onChildAdded(toDoListRef, (snapshot) => {
                const newItem = snapshot.val();
                renderToDoItem(newItem, snapshot.key);
            });
        }
    }
});