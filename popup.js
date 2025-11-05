// Select elements
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const linkInput = document.getElementById("link");
const addBtn = document.getElementById("addBtn");
const notesList = document.getElementById("notesList");

let editIndex = null; // Track which note is being edited

// Load notes on start
document.addEventListener("DOMContentLoaded", showNotes);

// Add or update note
addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const link = linkInput.value.trim();

    if (!name || !description) {
        alert("Please fill in both name and description!");
        return;
    }

    const notes = JSON.parse(localStorage.getItem("checkNotes")) || [];

    if (editIndex !== null) {
        // Update existing note
        notes[editIndex].name = name;
        notes[editIndex].description = description;
        notes[editIndex].link = link;
        localStorage.setItem("checkNotes", JSON.stringify(notes));

        addBtn.textContent = "Add Note";
        editIndex = null;
    } else {
        // Add new note
        const newNote = { name, description, link, checked: false };
        notes.push(newNote);
        localStorage.setItem("checkNotes", JSON.stringify(notes));
    }

    nameInput.value = "";
    descriptionInput.value = "";
    linkInput.value = "";

    showNotes();
});

// Show all notes
function showNotes() {
    const notes = JSON.parse(localStorage.getItem("checkNotes")) || [];
    notesList.innerHTML = "";

    notes.forEach((note, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
      <div class="note-header">
        <div style="display:flex; align-items:center; gap:5px;">
          <input type="checkbox" class="check-box" data-index="${index}" ${note.checked ? "checked" : ""
            } />
          <span class="note-title ${note.checked ? "checked" : ""}">${note.name
            }</span>
        </div>
        <div class="actions">
          <span class="edit-btn" data-index="${index}">✏️</span>
          <span class="delete-btn" data-index="${index}">✖</span>
        </div>
      </div>
      <div class="note-description">${note.description}</div>
      ${note.link
                ? `<div class="note-link"><a href="${note.link}" target="_blank">🔗 Visit</a></div>`
                : ""
            }
    `;

        notesList.appendChild(li);
    });

    // Delete note
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            deleteNote(index);
        });
    });

    // Edit note
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            editNote(index);
        });
    });

    // Check/uncheck note
    document.querySelectorAll(".check-box").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const index = e.target.getAttribute("data-index");
            toggleChecked(index, e.target.checked);
        });
    });
}

// Delete a note
function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem("checkNotes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("checkNotes", JSON.stringify(notes));
    showNotes();
}

// Toggle checked state
function toggleChecked(index, isChecked) {
    const notes = JSON.parse(localStorage.getItem("checkNotes")) || [];
    notes[index].checked = isChecked;
    localStorage.setItem("checkNotes", JSON.stringify(notes));
    showNotes();
}

// Edit a note
function editNote(index) {
    const notes = JSON.parse(localStorage.getItem("checkNotes")) || [];
    const note = notes[index];

    nameInput.value = note.name;
    descriptionInput.value = note.description;
    linkInput.value = note.link;

    editIndex = index;
    addBtn.textContent = "Update Note";
}