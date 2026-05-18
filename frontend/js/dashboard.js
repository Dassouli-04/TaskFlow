const activeProjectsCount = document.getElementById("activeProjectsCount");
const assignedTasksCount = document.getElementById("assignedTasksCount");
const completedTasksCount = document.getElementById("completedTasksCount");
const lateTasksCount = document.getElementById("lateTasksCount");
const currentTasksList = document.getElementById("currentTasksList");

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
};

const loadDashboard = async () => {
  try {
    const response = await api.get("/dashboard");

    const data = response.data;

    activeProjectsCount.textContent = data.activeProjectsCount;
    assignedTasksCount.textContent = data.assignedTasksCount;
    completedTasksCount.textContent = data.completedTasksCount;
    lateTasksCount.textContent = data.lateTasksCount;

    const tasks = data.currentTasks || [];

    if (!tasks.length) {
      currentTasksList.innerHTML = "<p>No current tasks.</p>";
      return;
    }

    currentTasksList.innerHTML = tasks.map((task) => `
      <div class="project-item">
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p><strong>Project:</strong> ${task.project?.title || "Unknown project"}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Deadline:</strong> ${formatDate(task.deadline)}</p>

        <div class="project-actions">
          <button onclick="updateTaskStatusFromDashboard('${task._id}', 'en cours')">
            Start
          </button>

          <button onclick="updateTaskStatusFromDashboard('${task._id}', 'terminé')">
            Finish
          </button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    currentTasksList.innerHTML = "<p>Could not load dashboard.</p>";
  }
};

const updateTaskStatusFromDashboard = async (taskId, status) => {
  try {
    await api.patch(/tasks/${taskId}/status, {
      status
    });

    await loadDashboard();
  } catch (error) {
    alert(error.response?.data?.message || "Could not update task status");
  }
};

loadDashboard();