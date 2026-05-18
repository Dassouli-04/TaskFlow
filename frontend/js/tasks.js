const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");
const filterAssignedTo = document.getElementById("filterAssignedTo");
const searchInput = document.getElementById("searchInput");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const prevTasksPageBtn = document.getElementById("prevTasksPageBtn");
const nextTasksPageBtn = document.getElementById("nextTasksPageBtn");
const tasksPageInfo = document.getElementById("tasksPageInfo");

let currentTasksPage = 1;
const tasksLimit = 5;
let tasksTotalPages = 1;
const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const deadlineInput = document.getElementById("deadline");
const submitTaskBtn = document.getElementById("submitTaskBtn");
const taskMessage = document.getElementById("taskMessage");
const tasksList = document.getElementById("tasksList");
const projectTitle = document.getElementById("projectTitle");
const assignedToInput = document.getElementById("assignedTo");
const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");
const draftKey = `taskDraft-${projectId}`;
const inviteMemberForm = document.getElementById("inviteMemberForm");
const memberEmailInput = document.getElementById("memberEmail");
const memberMessage = document.getElementById("memberMessage");
const membersList = document.getElementById("membersList");


if (!projectId) {
  alert("Project ID is missing");
  window.location.href = "projects.html";
}

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
};

const resetTaskForm = () => {
  taskIdInput.value = "";
  titleInput.value = "";
  descriptionInput.value = "";
  priorityInput.value = "";
  statusInput.value = "à faire";
  if (assignedToInput) {
    assignedToInput.value = "";
  }
  deadlineInput.value = "";
  submitTaskBtn.textContent = "Create task";
};

const loadProject = async () => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    projectTitle.textContent = `Tasks — ${response.data.project.title}`;
  } catch (error) {
    projectTitle.textContent = "Project Tasks";
  }
};

const loadTasks = async () => {
  try {
    const params = new URLSearchParams();

    params.append("page", currentTasksPage);
    params.append("limit", tasksLimit);

    if (filterStatus.value) {
      params.append("status", filterStatus.value);
    }

    if (filterPriority.value) {
      params.append("priority", filterPriority.value);
    }

    if (filterAssignedTo.value) {
      params.append("assignedTo", filterAssignedTo.value);
    }

    if (searchInput.value.trim()) {
      params.append("search", searchInput.value.trim());
    }

    const response = await api.get(
      `/projects/${projectId}/tasks?${params.toString()}`
    );

    const tasks = response.data.data || [];

    tasksTotalPages = response.data.totalPages || 1;
    currentTasksPage = response.data.page || 1;

    tasksPageInfo.textContent = `Page ${currentTasksPage} of ${tasksTotalPages}`;

    prevTasksPageBtn.disabled = currentTasksPage <= 1;
    nextTasksPageBtn.disabled = currentTasksPage >= tasksTotalPages;

    if (!tasks.length) {
      tasksList.innerHTML = "<p>No tasks found.</p>";
      return;
    }

    tasksList.innerHTML = tasks.map((task) => `
      <div class="project-item">
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Deadline:</strong> ${formatDate(task.deadline)}</p>
        <p><strong>Assigned to:</strong> ${
          task.assignedTo ? `${task.assignedTo.fullName} (${task.assignedTo.email})` : "Non assigné"
        }</p>

        <div class="project-actions">
          <button onclick="editTask('${task._id}')">Edit</button>
          <button onclick="changeTaskStatus('${task._id}', 'en cours')">Start</button>
          <button onclick="changeTaskStatus('${task._id}', 'terminé')">Finish</button>
          <button onclick="deleteTask('${task._id}')">Delete</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    tasksList.innerHTML = "<p>Could not load tasks.</p>";
  }
};

const editTask = async (id) => {
  try {
    localStorage.removeItem(draftKey);
    const response = await api.get(`/tasks/${id}`);
    const task = response.data.task || response.data;

    taskIdInput.value = task._id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    priorityInput.value = task.priority;
    statusInput.value = task.status;
    assignedToInput.value = task.assignedTo ? task.assignedTo._id : "";
    if (task.deadline) {
      deadlineInput.value = task.deadline.substring(0, 10);
    } else {
      deadlineInput.value = "";
    }

    submitTaskBtn.textContent = "Update task";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    taskMessage.textContent = "Could not load task.";
  }
};

const changeTaskStatus = async (id, status) => {
  try {
    await api.patch(`/tasks/${id}/status`, {
      status
    });

    taskMessage.textContent = "Status updated successfully";
    await loadTasks();
  } catch (error) {
    taskMessage.textContent =
      error.response?.data?.message || "Could not update status";
  }
};

const deleteTask = async (id) => {
  const confirmed = confirm("Are you sure you want to delete this task?");

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/tasks/${id}`);
    taskMessage.textContent = "Task deleted successfully";
    await loadTasks();
  } catch (error) {
    taskMessage.textContent =
      error.response?.data?.message || "Could not delete task";
  }
};

if (taskForm) {
  taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskData = {
      title: titleInput.value,
      description: descriptionInput.value,
      priority: priorityInput.value,
      status: statusInput.value,
      project: projectId,
      assignedTo: assignedToInput.value || null,
      deadline: deadlineInput.value || null
    };

    try {
      const taskId = taskIdInput.value;

      if (taskId) {
        await api.put(`/tasks/${taskId}`, taskData);
        taskMessage.textContent = "Task updated successfully";
      } else {
        await api.post("/tasks", taskData);
        taskMessage.textContent = "Task created successfully";
      }
      localStorage.removeItem(draftKey);
      resetTaskForm();
      await loadTasks();
    } catch (error) {
      taskMessage.textContent =
        error.response?.data?.message || "Could not save task";
    }
  });
}


const loadMembers = async () => {
  try {
    const response = await api.get(`/projects/${projectId}/members`);

    const owner = response.data.owner;
    const members = response.data.members || [];

    if (assignedToInput) {
      assignedToInput.innerHTML = `<option value="">Non assigné</option>`;
    }

    if (filterAssignedTo) {
      filterAssignedTo.innerHTML = `<option value="">All members</option>`;
    }

    if (membersList) {
      membersList.innerHTML = "";
    }

    if (owner) {
      if (assignedToInput) {
        const assignOption = document.createElement("option");
        assignOption.value = owner._id;
        assignOption.textContent = `${owner.fullName} (${owner.email}) - Créateur`;
        assignedToInput.appendChild(assignOption);
      }

      if (filterAssignedTo) {
        const filterOption = document.createElement("option");
        filterOption.value = owner._id;
        filterOption.textContent = `${owner.fullName} (${owner.email}) - Créateur`;
        filterAssignedTo.appendChild(filterOption);
      }

      if (membersList) {
        membersList.innerHTML += `
          <div class="project-item">
            <p><strong>${owner.fullName}</strong> (${owner.email})</p>
            <p>Créateur du projet</p>
          </div>
        `;
      }
    }

    members.forEach((member) => {
      if (assignedToInput) {
        const assignOption = document.createElement("option");
        assignOption.value = member._id;
        assignOption.textContent = `${member.fullName} (${member.email})`;
        assignedToInput.appendChild(assignOption);
      }

      if (filterAssignedTo) {
        const filterOption = document.createElement("option");
        filterOption.value = member._id;
        filterOption.textContent = `${member.fullName} (${member.email})`;
        filterAssignedTo.appendChild(filterOption);
      }

      if (membersList) {
        membersList.innerHTML += `
          <div class="project-item">
            <p><strong>${member.fullName}</strong> (${member.email})</p>

            <button onclick="removeMember('${member._id}')">
              Remove
            </button>
          </div>
        `;
      }
    });
  } catch (error) {
    console.error("Erreur chargement membres:", error);
  }
};


if (inviteMemberForm) {
  inviteMemberForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await api.post(`/projects/${projectId}/members`, {
        email: memberEmailInput.value
      });

      memberMessage.textContent = "Membre ajouté avec succès";
      memberEmailInput.value = "";

      await loadMembers();
      await loadTasks();
    } catch (error) {
      memberMessage.textContent =
        error.response?.data?.message || "Impossible d'ajouter ce membre";
    }
  });
}

const removeMember = async (memberId) => {
  const confirmed = confirm("Voulez-vous vraiment retirer ce membre du projet ?");

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/projects/${projectId}/members/${memberId}`);

    memberMessage.textContent = "Membre retiré avec succès";

    await loadMembers();
    await loadTasks();
  } catch (error) {
    memberMessage.textContent =
      error.response?.data?.message || "Impossible de retirer ce membre";
  }
};


if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", async () => {
    currentTasksPage = 1;
    await loadTasks();
  });
}

if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", async () => {
    filterStatus.value = "";
    filterPriority.value = "";
    filterAssignedTo.value = "";
    searchInput.value = "";
    currentTasksPage = 1;
    await loadTasks();
  });
}

if (prevTasksPageBtn) {
  prevTasksPageBtn.addEventListener("click", async () => {
    if (currentTasksPage > 1) {
      currentTasksPage--;
      await loadTasks();
    }
  });
}

if (nextTasksPageBtn) {
  nextTasksPageBtn.addEventListener("click", async () => {
    if (currentTasksPage < tasksTotalPages) {
      currentTasksPage++;
      await loadTasks();
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      currentTasksPage = 1;
      await loadTasks();
    }
  });
}

const getTaskFormData = () => {
  return {
    title: titleInput.value,
    description: descriptionInput.value,
    priority: priorityInput.value,
    status: statusInput.value,
    assignedTo: assignedToInput ? assignedToInput.value : "",
    deadline: deadlineInput.value
  };
};


const fillTaskForm = (data) => {
  titleInput.value = data.title || "";
  descriptionInput.value = data.description || "";
  priorityInput.value = data.priority || "";
  statusInput.value = data.status || "à faire";
  deadlineInput.value = data.deadline || "";

  if (assignedToInput && data.assignedTo !== undefined) {
    assignedToInput.value = data.assignedTo || "";
  }
};


const saveTaskDraft = () => {
  const taskId = taskIdInput.value;

  if (taskId) {
    return;
  }

  
  const draftData = getTaskFormData();

  const hasContent =
    draftData.title ||
    draftData.description ||
    draftData.priority ||
    draftData.status !== "à faire" ||
    draftData.assignedTo ||
    draftData.deadline;

  if (!hasContent) {
    localStorage.removeItem(draftKey);
    return;
  }

  localStorage.setItem(draftKey, JSON.stringify(draftData));
};


const enableDraftAutoSave = () => {
  const fields = [
    titleInput,
    descriptionInput,
    priorityInput,
    statusInput,
    deadlineInput
  ];

  if (assignedToInput) {
    fields.push(assignedToInput);
  }

  fields.forEach((field) => {
    field.addEventListener("input", saveTaskDraft);
    field.addEventListener("change", saveTaskDraft);
  });
};


const restoreTaskDraft = () => {
  const savedDraft = localStorage.getItem(draftKey);

  if (!savedDraft) {
    return;
  }

  const shouldRestore = confirm(
    "Un brouillon de tâche existe pour ce projet. Voulez-vous le restaurer ?"
  );

  if (!shouldRestore) {
    localStorage.removeItem(draftKey);
    return;
  }

  try {
    const draftData = JSON.parse(savedDraft);
    fillTaskForm(draftData);
  } catch (error) {
    localStorage.removeItem(draftKey);
  }
};


const initTasksPage = async () => {
  await loadProject();
  await loadMembers();
  await loadTasks();

  enableDraftAutoSave();
  restoreTaskDraft();
};

initTasksPage();