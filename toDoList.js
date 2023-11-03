import app from "./firebaseconfig.js";
import { getDatabase, ref, push, set, remove, onChildAdded } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
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
    newListItem.classList.add("d-flex");
    newListItem.innerHTML = `
                <h3 class="flex-grow-1">${item.text}</h3>
                <button class="btn btn-warning mx-3 edit-btn" style="color: white;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
              </svg></button>
                <button class="btn btn-danger delete-btn"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
              </svg></button>
            `;
    newListItem.setAttribute('data-key', itemKey);
    parentList.appendChild(newListItem);
}

let cbtn = document.getElementById('add_btn');
cbtn.addEventListener('click', addChapter);
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addChapter();
    }
});
function addChapter() {
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