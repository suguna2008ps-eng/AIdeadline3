// =====================================
// DEADLINE AI - FRONTEND JAVASCRIPT
// =====================================

const API_URL = "http://localhost:5000/api/deadlines";

// HTML Elements
const addButton = document.getElementById("addButton");
const closeFormButton = document.getElementById("closeForm");
const deadlineForm = document.getElementById("deadlineForm");
const saveButton = document.getElementById("saveDeadline");

const taskNameInput = document.getElementById("taskName");
const subjectInput = document.getElementById("subject");
const deadlineDateInput = document.getElementById("deadlineDate");
const deadlineTimeInput = document.getElementById("deadlineTime");
const priorityInput = document.getElementById("priority");

const deadlineList = document.getElementById("deadlineList");

const totalCount = document.getElementById("totalCount");
const urgentCount = document.getElementById("urgentCount");
const upcomingCount = document.getElementById("upcomingCount");
const completedCount = document.getElementById("completedCount");

let deadlines = [];


// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(message, type = "success") {
    let messageBox = document.getElementById("messageBox");

    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "messageBox";

        messageBox.style.padding = "12px";
        messageBox.style.margin = "10px 0";
        messageBox.style.borderRadius = "8px";

        deadlineForm.insertAdjacentElement("afterend", messageBox);
    }

    messageBox.textContent = message;

    messageBox.style.color =
        type === "error" ? "#dc2626" : "#15803d";

    messageBox.style.display = "block";

    clearTimeout(messageBox.hideTimer);

    messageBox.hideTimer = setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}


// =====================================
// OPEN AND CLOSE FORM
// =====================================

function openForm() {
    deadlineForm.style.display = "block";
}

function closeForm() {
    deadlineForm.style.display = "none";
}

addButton.addEventListener("click", openForm);

closeFormButton.addEventListener("click", closeForm);


// =====================================
// LOAD DEADLINES FROM BACKEND
// =====================================

async function loadDeadlines() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load deadlines");
        }

        deadlines = await response.json();

        displayDeadlines();
        updateDashboard();

    } catch (error) {
        console.error("Loading error:", error);

        showMessage(
            "Backend connect aagala. Server running-ah check pannu.",
            "error"
        );
    }
}


// =====================================
// ADD DEADLINE
// =====================================

async function addDeadline() {
    const title = taskNameInput.value.trim();
    const subject = subjectInput.value.trim();
    const date = deadlineDateInput.value;
    const time = deadlineTimeInput.value;
    const priority = priorityInput.value;

    if (!title || !subject || !date || !time || !priority) {
        showMessage("Ella fields-um fill pannu!", "error");
        return;
    }

    const deadlineDateTime = new Date(`${date}T${time}`);

    if (Number.isNaN(deadlineDateTime.getTime())) {
        showMessage("Correct date and time select pannu.", "error");
        return;
    }

    const deadlineData = {
        title,
        subject,
        date,
        time,
        priority,
        completed: false
    };

    try {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(deadlineData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Save failed");
        }

        showMessage("Deadline successfully added!", "success");

        taskNameInput.value = "";
        subjectInput.value = "";
        deadlineDateInput.value = "";
        deadlineTimeInput.value = "";
        priorityInput.value = "High";

        closeForm();

        await loadDeadlines();

    } catch (error) {
        console.error("Add error:", error);

        showMessage(
            "Deadline save aagala. Backend check pannu.",
            "error"
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Deadline";
    }
}

saveButton.addEventListener("click", addDeadline);


// =====================================
// DISPLAY DEADLINES
// =====================================

function displayDeadlines() {
    deadlineList.innerHTML = "";

    if (deadlines.length === 0) {
        deadlineList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No deadlines yet</h3>
                <p>Click "Add Deadline" to create your first deadline.</p>
            </div>
        `;

        return;
    }

    const sortedDeadlines = [...deadlines].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);

        return dateA - dateB;
    });

    sortedDeadlines.forEach((deadline) => {
        const card = document.createElement("div");

        card.className = "deadline-card";

        if (deadline.completed) {
            card.classList.add("completed");
        }

        const title = document.createElement("h3");
        title.textContent = deadline.title;

        const subject = document.createElement("p");
        subject.textContent = `📚 Subject: ${deadline.subject}`;

        const date = document.createElement("p");
        date.textContent = `📅 Date: ${deadline.date}`;

        const time = document.createElement("p");
        time.textContent = `⏰ Time: ${deadline.time}`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${deadline.priority}`;

        const status = document.createElement("p");
        status.textContent = deadline.completed
            ? "✅ Completed"
            : "⏳ Pending";

        const completeButton = document.createElement("button");

        completeButton.textContent = deadline.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", () => {
            toggleComplete(deadline);
        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteDeadline(deadline);
        });

        card.append(
            title,
            subject,
            date,
            time,
            priority,
            status,
            completeButton,
            deleteButton
        );

        deadlineList.appendChild(card);
    });
}


// =====================================
// UPDATE DASHBOARD
// =====================================

function updateDashboard() {
    const total = deadlines.length;

    const completed = deadlines.filter(
        item => item.completed
    ).length;

    const pendingDeadlines = deadlines.filter(
        item => !item.completed
    );

    const now = new Date();

    const urgent = pendingDeadlines.filter(item => {
        const dueDate = new Date(`${item.date}T${item.time}`);

        const hoursRemaining =
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursRemaining >= 0 && hoursRemaining <= 24;
    }).length;

    const upcoming = pendingDeadlines.filter(item => {
        const dueDate = new Date(`${item.date}T${item.time}`);

        const hoursRemaining =
            (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursRemaining > 24;
    }).length;

    totalCount.textContent = total;
    urgentCount.textContent = urgent;
    upcomingCount.textContent = upcoming;
    completedCount.textContent = completed;
}


// =====================================
// COMPLETE OR UNDO DEADLINE
// =====================================

async function toggleComplete(deadline) {
    const id = deadline.id ?? deadline._id;

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: !deadline.completed
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Update failed");
        }

        showMessage(
            deadline.completed
                ? "Deadline pending-ku maathiyachu!"
                : "Deadline completed!",
            "success"
        );

        await loadDeadlines();

    } catch (error) {
        console.error("Update error:", error);

        showMessage("Update panna mudiyala.", "error");
    }
}


// =====================================
// DELETE DEADLINE
// =====================================

async function deleteDeadline(deadline) {
    const confirmed = confirm(
        "Indha deadline-ai delete pannava?"
    );

    if (!confirmed) {
        return;
    }

    const id = deadline.id ?? deadline._id;

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        showMessage("Deadline deleted successfully!", "success");

        await loadDeadlines();

    } catch (error) {
        console.error("Delete error:", error);

        showMessage("Delete panna mudiyala.", "error");
    }
}


// =====================================
// INITIALIZE APPLICATION
// =====================================

deadlineForm.style.display = "none";

loadDeadlines();