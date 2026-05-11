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
  assignedToInput.value = "";
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
    const response = await api.get(`/projects/${projectId}/tasks`);
    const tasks = response.data;

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
    const response = await api.get(`/tasks/${id}`);
    const task = response.data.task;

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

    assignedToInput.innerHTML = `<option value="">Non assigné</option>`;

    if (owner) {
      const option = document.createElement("option");
      option.value = owner._id;
      option.textContent = `${owner.fullName} (${owner.email}) - Créateur`;
      assignedToInput.appendChild(option);
    }

    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member._id;
      option.textContent = `${member.fullName} (${member.email})`;
      assignedToInput.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur chargement membres:", error);
  }
};


loadProject();
loadMembers();
loadTasks();