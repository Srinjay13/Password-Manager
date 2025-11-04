// --------- DOM Elements ---------
const siteInput = document.getElementById("site");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const saveBtn = document.getElementById("saveBtn");
const passwordTable = document
  .getElementById("passwordTable")
  .querySelector("tbody");
const searchInput = document.getElementById("search");
const masterKeyInput = document.getElementById("masterKey");
const unlockBtn = document.getElementById("unlockBtn");

// --------- Globals ---------
let isUnlocked = false; // Controls visibility
// --------- Master Key Handling ---------
function getMasterKey() {
  return localStorage.getItem("masterKey");
}

function setMasterKey(key) {
  localStorage.setItem("masterKey", key);
}


// --------- Load Data from LocalStorage ---------
function loadPasswords() {
  const saved = localStorage.getItem("passwords");
  return saved ? JSON.parse(saved) : [];
}

// --------- Save Data to LocalStorage ---------
function savePasswords(passwords) {
  localStorage.setItem("passwords", JSON.stringify(passwords));
}

// --------- Render Passwords to Table ---------
function renderPasswords(filter = "") {
  const passwords = loadPasswords();
  passwordTable.innerHTML = "";

  const filtered = passwords.filter(
    (entry) =>
      entry.site.toLowerCase().includes(filter.toLowerCase()) ||
      entry.username.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    passwordTable.innerHTML =
      '<tr><td colspan="4" style="text-align:center; opacity:0.7;">No passwords found</td></tr>';
    return;
  }

  filtered.forEach((entry, index) => {
    const row = document.createElement("tr");

    const siteCell = document.createElement("td");
    siteCell.textContent = entry.site;

    const usernameCell = document.createElement("td");
    usernameCell.textContent = entry.username;

    const passwordCell = document.createElement("td");
    passwordCell.textContent = isUnlocked ? atob(entry.password) : "••••••••";

    const actionCell = document.createElement("td");

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.classList.add("action-btn", "copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(atob(entry.password));
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("action-btn", "delete-btn");
    deleteBtn.addEventListener("click", () => {
      deletePassword(index);
    });

    actionCell.appendChild(copyBtn);
    actionCell.appendChild(deleteBtn);

    row.appendChild(siteCell);
    row.appendChild(usernameCell);
    row.appendChild(passwordCell);
    row.appendChild(actionCell);

    passwordTable.appendChild(row);
  });
}

// --------- Add New Password ---------
function addPassword() {
  const site = siteInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!site || !username || !password) {
    alert("⚠️ Please fill in all fields!");
    return;
  }

  const passwords = loadPasswords();
  passwords.push({ site, username, password });
  savePasswords(passwords);

  siteInput.value = "";
  usernameInput.value = "";
  passwordInput.value = "";

  renderPasswords();
}

// --------- Delete Password ---------
function deletePassword(index) {
  const passwords = loadPasswords();
  if (confirm(`Delete password for site: ${passwords[index].site} and user: ${passwords[index].username}?`)) {
    passwords.splice(index, 1);
    savePasswords(passwords);
    renderPasswords(searchInput.value);
  }
}


// --------- Unlock Feature ---------
function unlockPasswords() {
  if (isUnlocked) {
    alert("🔓 Already unlocked!");
    return;
  }

  const storedKey = getMasterKey();
  if (!storedKey) {
    alert("⚠️ No master key set yet! Please set one first.");
    return;
  }

  const enteredKey = masterKeyInput.value.trim();
  if (enteredKey === storedKey) {
    isUnlocked = true;
    masterKeyInput.value = "";
    unlockBtn.textContent = "Unlocked 🔓";
    unlockBtn.style.opacity = "0.7";
    alert("✅ Unlocked successfully!");
    renderPasswords(searchInput.value);
  } else {
    alert("❌ Incorrect master key!");
    masterKeyInput.value = ""; // clear the input field
  masterKeyInput.focus(); // optional: puts the cursor back in the input
  }
//   masterKeyInput.value = ""; // Always clear input after attempt
}

// --------- Set Master Key Feature ---------
function setNewMasterKey() {
  const newKey = prompt("Enter a new master key:");
  if (!newKey) {
    alert("⚠️ Master key cannot be empty!");
    masterKeyInput.value = "";
    return;
  }

  // Save the new key
  setMasterKey(newKey);
  alert("✅ Master key has been set successfully!");

  // 🧹 Clear input
  masterKeyInput.value = "";

  // 🔐 Security: relock immediately if user was unlocked
  if (isUnlocked) {
    isUnlocked = false;
    unlockBtn.disabled = false;
    unlockBtn.textContent = "Unlock";
    unlockBtn.style.opacity = "1";
    alert("🔒 App relocked because the master key changed.");
    location.reload(); // 🔁 reload the page to reset everything cleanly
  }
}

document.getElementById("setKeyBtn").addEventListener("click", setNewMasterKey);


// --------- Search Filter ---------
searchInput.addEventListener("input", () => {
  renderPasswords(searchInput.value);
});

// --------- Event Listeners ---------
saveBtn.addEventListener("click", addPassword);
unlockBtn.addEventListener("click", unlockPasswords);

// --------- Initialize ---------
renderPasswords();
