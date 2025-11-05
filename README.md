📝 Check Note – Chrome Extension

Check Note is a simple and lightweight Chrome extension that lets you quickly save and manage notes right inside your browser.
Each note includes a Name, Description, and an optional Link.
You can add, edit, delete, or mark notes as checked (completed) — and everything is stored locally using localStorage.

✨ Features

✅ Add notes with name, description, and link
✅ Mark notes as checked (adds line-through styling)
✅ Edit existing notes easily
✅ Delete any note
✅ Data is saved in localStorage, so your notes persist even after closing Chrome
✅ Simple, fast, and clean interface

🧩 Folder Structure
check-note/
│
├── manifest.json       # Chrome Extension configuration
├── popup.html          # Main UI
├── popup.js            # App logic (Add, Edit, Delete, Check)
├── popup.css           # Styling
├── icon.png            # Extension icon
└── README.md           # Documentation

⚙️ Installation Guide

Download or clone this repository

git clone https://github.com/takbirgazi/check_note_chrome_extension.git


You’ll see the Check Note icon appear in your Chrome toolbar.
Click it to open the extension popup.

Click “Add Note” to save it.

Your notes appear in a list below:

✅ Click the checkbox to mark it as complete.

✏️ Click the edit icon to modify.

❌ Click the delete icon to remove it.

All notes are saved locally (via localStorage).


🧰 Tech Stack

HTML5

CSS3

JavaScript (ES6)

Chrome Extension Manifest v3

localStorage

👨‍💻 Author

Md. Takbir Gazi
📧 takbirgazibd@gmail.com