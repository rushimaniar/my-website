const familyMembers = [
  {
    id: "raman",
    name: "Raman",
    email: "raman@yourdomain.com",
    initials: "RM",
    status: "Owner",
  },
  {
    id: "partner",
    name: "Partner",
    email: "partner@yourdomain.com",
    initials: "PA",
    status: "Family",
  },
  {
    id: "family",
    name: "Family",
    email: "family@yourdomain.com",
    initials: "FA",
    status: "Shared",
  },
];

const starterTasks = [
  {
    id: "t1",
    title: "Finish iCloud custom domain DNS records",
    assignee: "raman",
    scope: "mine",
    due: "Today",
    priority: "high",
    done: false,
  },
  {
    id: "t2",
    title: "Create family mailbox addresses",
    assignee: "family",
    scope: "family",
    due: "This week",
    priority: "normal",
    done: false,
  },
  {
    id: "t3",
    title: "Draft reusable packing checklist",
    assignee: "partner",
    scope: "family",
    due: "Saturday",
    priority: "low",
    done: false,
  },
  {
    id: "t4",
    title: "Pick the first shared reminder emails",
    assignee: "raman",
    scope: "later",
    due: "Later",
    priority: "normal",
    done: true,
  },
];

const starterMessages = [
  {
    id: "m1",
    owner: "raman",
    title: "Mailbox setup",
    body: "iCloud will own MX records; Cloudflare keeps DNS and the website.",
  },
  {
    id: "m2",
    owner: "family",
    title: "Reminder plan",
    body: "Use notifications@yourdomain.com for app-generated task alerts.",
  },
];

const agenda = [
  ["8:30", "School drop-off", "Family calendar"],
  ["12:00", "Check mail DNS verification", "Raman"],
  ["17:30", "Grocery stop", "Shared task"],
  ["19:00", "House reset reminder", "Family"],
];

const state = {
  currentUserId: localStorage.getItem("familyHub.currentUser") || "raman",
  filter: "mine",
  tasks: readStored("familyHub.tasks", starterTasks),
  messages: readStored("familyHub.messages", starterMessages),
};

const els = {
  app: document.querySelector("#app"),
  openAppButton: document.querySelector("#openAppButton"),
  heroOpenAppButton: document.querySelector("#heroOpenAppButton"),
  closeAppButton: document.querySelector("#closeAppButton"),
  loginDialog: document.querySelector("#loginDialog"),
  loginOptions: document.querySelector("#loginOptions"),
  switchUserButton: document.querySelector("#switchUserButton"),
  currentUserName: document.querySelector("#currentUserName"),
  currentUserEmail: document.querySelector("#currentUserEmail"),
  assigneeInput: document.querySelector("#assigneeInput"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskList: document.querySelector("#taskList"),
  agendaList: document.querySelector("#agendaList"),
  mailboxList: document.querySelector("#mailboxList"),
  messageList: document.querySelector("#messageList"),
  memberList: document.querySelector("#memberList"),
  todayDate: document.querySelector("#todayDate"),
  newMessageButton: document.querySelector("#newMessageButton"),
};

function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  localStorage.setItem("familyHub.currentUser", state.currentUserId);
  localStorage.setItem("familyHub.tasks", JSON.stringify(state.tasks));
  localStorage.setItem("familyHub.messages", JSON.stringify(state.messages));
}

function currentUser() {
  return familyMembers.find((member) => member.id === state.currentUserId) || familyMembers[0];
}

function assignedName(id) {
  return familyMembers.find((member) => member.id === id)?.name || "Family";
}

function renderLoginOptions() {
  els.loginOptions.innerHTML = "";
  familyMembers.forEach((member) => {
    const button = document.createElement("button");
    button.className = "login-option";
    button.type = "button";
    button.innerHTML = `
      <span class="member-avatar">${member.initials}</span>
      <span><strong>${member.name}</strong><span>${member.email}</span></span>
    `;
    button.addEventListener("click", () => {
      state.currentUserId = member.id;
      persist();
      render();
      els.loginDialog.close();
    });
    els.loginOptions.append(button);
  });
}

function renderAssignees() {
  els.assigneeInput.innerHTML = "";
  familyMembers.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.name;
    els.assigneeInput.append(option);
  });
  els.assigneeInput.value = currentUser().id;
}

function renderAgenda() {
  els.todayDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
  els.agendaList.innerHTML = agenda
    .map(
      ([time, title, label]) => `
      <article class="agenda-item">
        <div class="agenda-time">${time}</div>
        <div><strong>${title}</strong><span>${label}</span></div>
      </article>
    `,
    )
    .join("");
}

function taskVisible(task) {
  if (state.filter === "mine") return task.assignee === currentUser().id;
  if (state.filter === "family") return task.scope === "family";
  return task.scope === "later";
}

function renderTasks() {
  const visibleTasks = state.tasks.filter(taskVisible);
  if (!visibleTasks.length) {
    els.taskList.innerHTML = `<div class="task-row"><div></div><div class="task-main"><strong>No tasks here yet</strong><span>Add one with the quick input above.</span></div><span class="tag">Empty</span></div>`;
    return;
  }
  els.taskList.innerHTML = "";
  visibleTasks.forEach((task) => {
    const row = document.createElement("article");
    row.className = `task-row ${task.done ? "is-done" : ""}`;
    row.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} aria-label="Toggle ${task.title}" />
      <div class="task-main">
        <strong>${task.title}</strong>
        <span class="task-meta">
          <span class="priority-dot ${task.priority}"></span>
          ${task.due} · ${assignedName(task.assignee)}
        </span>
      </div>
      <span class="tag">${task.scope}</span>
    `;
    row.querySelector("input").addEventListener("change", (event) => {
      task.done = event.target.checked;
      persist();
      renderTasks();
    });
    els.taskList.append(row);
  });
}

function renderMailboxes() {
  const visibleMailboxes = familyMembers.filter(
    (member) => member.id === currentUser().id || member.id === "family",
  );
  els.mailboxList.innerHTML = visibleMailboxes
    .map(
      (member) => `
      <article class="mailbox-row">
        <span class="mailbox-icon">@</span>
        <div><strong>${member.email}</strong><span>iCloud mailbox · ${member.name}</span></div>
      </article>
    `,
    )
    .join("");
}

function renderMessages() {
  const visibleMessages = state.messages.filter(
    (message) => (message.owner || "family") === currentUser().id || (message.owner || "family") === "family",
  );
  els.messageList.innerHTML = visibleMessages
    .map(
      (message) => `
      <article class="message-row">
        <div><strong>${message.title}</strong><span>${message.body}</span></div>
      </article>
    `,
    )
    .join("");
}

function renderMembers() {
  els.memberList.innerHTML = familyMembers
    .map(
      (member) => `
      <article class="member-row">
        <span class="member-avatar">${member.initials}</span>
        <div><strong>${member.name}</strong><span>${member.status} · ${member.email}</span></div>
      </article>
    `,
    )
    .join("");
}

function renderUser() {
  const user = currentUser();
  els.currentUserName.textContent = user.name;
  els.currentUserEmail.textContent = user.email;
}

function render() {
  renderUser();
  renderAssignees();
  renderAgenda();
  renderTasks();
  renderMailboxes();
  renderMessages();
  renderMembers();
}

els.openAppButton.addEventListener("click", () => {
  els.app.classList.remove("is-hidden");
  render();
});

els.heroOpenAppButton.addEventListener("click", () => {
  els.app.classList.remove("is-hidden");
  render();
});

els.closeAppButton.addEventListener("click", () => {
  els.app.classList.add("is-hidden");
});

els.switchUserButton.addEventListener("click", () => {
  renderLoginOptions();
  els.loginDialog.showModal();
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("is-active"));
    button.classList.add("is-active");
    state.filter = button.dataset.filter;
    renderTasks();
  });
});

document.querySelectorAll(".side-link").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".side-link").forEach((link) => link.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

els.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = els.taskInput.value.trim();
  if (!title) return;
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    assignee: els.assigneeInput.value,
    scope: els.assigneeInput.value === "family" ? "family" : "mine",
    due: "Today",
    priority: "normal",
    done: false,
  });
  els.taskInput.value = "";
  state.filter = "mine";
  document.querySelectorAll(".segment").forEach((segment) => {
    segment.classList.toggle("is-active", segment.dataset.filter === "mine");
  });
  persist();
  renderTasks();
});

els.newMessageButton.addEventListener("click", () => {
  state.messages.unshift({
    id: crypto.randomUUID(),
    owner: currentUser().id,
    title: "New private note",
    body: `Saved for ${currentUser().name}. Replace this with a real message form in the next build.`,
  });
  persist();
  renderMessages();
});

renderLoginOptions();
render();
