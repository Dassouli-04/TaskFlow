const assignedTasksList = document.getElementById("assignedTasksList");

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
};

const loadAssignedTasks = async () => {
  if (!assignedTasksList) {
    return;
  }

  try {
    const response = await api.get("/tasks/my/assigned");

    const tasks = response.data.data || [];

    if (!tasks.length) {
      assignedTasksList.innerHTML = "<p>No assigned tasks.</p>";
      return;
    }

    assignedTasksList.innerHTML = tasks.map((task) => `
      <div class="project-item">
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p><strong>Project:</strong> ${task.project?.title || "Unknown"}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Deadline:</strong> ${formatDate(task.deadline)}</p>

        <div class="project-actions">
          <button onclick="updateAssignedTaskStatus('${task._id}', 'en cours')">
            Start
          </button>
          <button onclick="updateAssignedTaskStatus('${task._id}', 'terminé')">
            Finish
          </button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    assignedTasksList.innerHTML = "<p>Could not load assigned tasks.</p>";
  }
};

const updateAssignedTaskStatus = async (taskId, status) => {
  try {
    await api.patch(`/tasks/${taskId}/status`, {
      status
    });

    await loadAssignedTasks();
  } catch (error) {
    alert(error.response?.data?.message || "Could not update task status");
  }
};

loadAssignedTasks();