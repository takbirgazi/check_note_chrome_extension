const STORAGE_KEY = "checkNotes";

const noteForm = document.getElementById("noteForm");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const linkInput = document.getElementById("link");
const addBtn = document.getElementById("addBtn");
const notesList = document.getElementById("notesList");
const statusLiveRegion = document.getElementById("statusMessage");

let editIndex = null;

document.addEventListener("DOMContentLoaded", () => {
    initializePopup().catch((error) => {
        console.error("Failed to initialize popup:", error);
        announceStatus("There was an issue loading your notes. Please try again.", true);
    });
});

async function initializePopup() {
    if (noteForm) {
        noteForm.addEventListener("submit", (event) => {
            event.preventDefault();
            handleAddOrUpdate().catch((error) => {
                console.error("Failed to save note:", error);
                announceStatus("We could not save your note. Please try again.", true);
            });
        });
    }

    [nameInput, descriptionInput, linkInput].forEach((input) => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                handleAddOrUpdate().catch((error) => {
                    console.error("Failed to save note:", error);
                    announceStatus("We could not save your note. Please try again.", true);
                });
            }
        });
    });
    await showNotes();
}

async function handleAddOrUpdate() {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const link = linkInput.value.trim();

    if (!name || !description) {
        announceStatus("Name and description are required to save a note.", true);
        nameInput.focus();
        return;
    }

    if (link && !isValidHttpsUrl(link)) {
        announceStatus("Please provide a valid HTTPS link or leave the field blank.", true);
        linkInput.focus();
        return;
    }

    const notes = await getNotes();
    const isUpdating = editIndex !== null;

    if (isUpdating) {
        notes[editIndex] = {
            ...notes[editIndex],
            name,
            description,
            link,
        };
    } else {
        notes.push({
            name,
            description,
            link,
            checked: false,
            createdAt: new Date().toISOString(),
        });
    }

    await saveNotes(notes);

    resetForm();
    await showNotes();

    announceStatus(isUpdating ? "Note updated successfully." : "Note added successfully.");
}

function resetForm() {
    nameInput.value = "";
    descriptionInput.value = "";
    linkInput.value = "";
    editIndex = null;
    addBtn.textContent = "Add Note";
    nameInput.focus();
}

async function showNotes() {
    const notes = await getNotes();
    notesList.innerHTML = "";

    if (!notes.length) {
        notesList.appendChild(createEmptyState());
        return;
    }

    notes.forEach((note, index) => {
        const listItem = createNoteListItem(note, index);
        notesList.appendChild(listItem);
    });
}

function createEmptyState() {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "No notes yet. Add your first note above.";
    emptyState.setAttribute("role", "status");
    emptyState.setAttribute("aria-live", "polite");
    return emptyState;
}

function createNoteListItem(note, index) {
    const li = document.createElement("li");
    li.className = "note-item";

    const header = document.createElement("div");
    header.className = "note-header";

    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "checkbox-container";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check-box";
    checkbox.checked = Boolean(note.checked);
    checkbox.setAttribute("aria-label", `Mark ${note.name} as complete`);
    checkbox.addEventListener("change", async (event) => {
        await toggleChecked(index, event.target.checked);
    });

    const title = document.createElement("span");
    title.className = `note-title ${note.checked ? "checked" : ""}`;
    title.textContent = note.name;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-button edit-btn";
    editButton.setAttribute("aria-label", `Edit ${note.name}`);
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editNote(index));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-button delete-btn";
    deleteButton.setAttribute("aria-label", `Delete ${note.name}`);
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(index));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    header.appendChild(checkboxContainer);
    header.appendChild(actions);

    const description = document.createElement("p");
    description.className = "note-description";
    description.textContent = note.description;

    li.appendChild(header);
    li.appendChild(description);

    if (note.link) {
        const linkWrapper = document.createElement("div");
        linkWrapper.className = "note-link";

        const linkAnchor = document.createElement("a");
        linkAnchor.href = note.link;
        linkAnchor.target = "_blank";
        linkAnchor.rel = "noopener noreferrer";
        linkAnchor.textContent = "Open Link";
        linkAnchor.setAttribute("aria-label", `Open link for ${note.name}`);

        linkWrapper.appendChild(linkAnchor);
        li.appendChild(linkWrapper);
    }

    return li;
}

async function deleteNote(index) {
    const notes = await getNotes();
    const [removed] = notes.splice(index, 1);
    await saveNotes(notes);
    await showNotes();
    announceStatus(`Deleted note "${removed?.name ?? "Untitled"}".`);
}

async function toggleChecked(index, isChecked) {
    const notes = await getNotes();
    if (!notes[index]) {
        return;
    }
    notes[index].checked = isChecked;
    await saveNotes(notes);
    await showNotes();
}

async function editNote(index) {
    const notes = await getNotes();
    const note = notes[index];
    if (!note) {
        announceStatus("Unable to find the selected note.", true);
        return;
    }

    nameInput.value = note.name;
    descriptionInput.value = note.description;
    linkInput.value = note.link ?? "";

    editIndex = index;
    addBtn.textContent = "Update Note";
    nameInput.focus();
}

async function getNotes() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : []);
        });
    });
}

async function saveNotes(notes) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: notes }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve();
        });
    });
}

function isValidHttpsUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function announceStatus(message, isError = false) {
    if (statusLiveRegion) {
        statusLiveRegion.textContent = message;
        statusLiveRegion.classList.toggle("status-error", isError);
    } else {
        console[isError ? "error" : "info"](message);
    }
}