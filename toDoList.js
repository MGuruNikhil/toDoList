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
                <h3 class="flex-grow-1" data-key=${itemKey}>${item.text}</h3>
                <button class="btn btn-warning mx-3 edit-btn" style="color: white;" data-key=${itemKey}>
                    <i class="bi bi-pen edit-btn" data-key=${itemKey}></i>
                </button>
                <button class="btn btn-danger delete-btn" data-key=${itemKey}>
                    <i class="bi bi-trash delete-btn" data-key=${itemKey}></i>
                </button>
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
    const parentList = document.getElementById('parentList');
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
    const parentList = document.getElementById('parentList');
    const itemKey = e.target.getAttribute('data-key');
    if (e.target.classList.contains('edit-btn')) {
        const newText = prompt("Enter new text");
        if (newText !== null) {
            const updatedText = newText.trim();
            if (updatedText !== "") {
                // Update the edited item in Firebase Realtime Database
                console.log(itemKey)
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
    else if (e.target.classList.contains('delete-btn')) {
        // Remove the item from Firebase Realtime Database
        if (userId) {
            remove(ref(db, 'users/' + userId + '/' + itemKey))
                .then(function () {
                    console.log("Removed item successfully")
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