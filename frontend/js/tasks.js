// Récupérer l'id du projet depuis l'URL : ?projectId=xxx
const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

if (!projectId) {
  alert("Aucun projet sélectionné.");
  window.location.href = "projects.html";
  throw new Error("No projectId");
}

const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskStatusInput = document.getElementById("taskStatus");
const taskDeadlineInput = document.getElementById("taskDeadline");
const submitTaskBtn = document.getElementById("submitTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const taskMessage = document.getElementById("taskMessage");
const tasksList = document.getElementById("tasksList");
const taskFormTitle = document.getElementById("taskFormTitle");
const projectTitle = document.getElementById("projectTitle");

const PRIORITY_LABELS = { basse: "🟢 Basse", moyenne: "🟡 Moyenne", haute: "🔴 Haute" };
const STATUS_LABELS = { "à faire": "📋 À faire", "en cours": "🔄 En cours", "terminé": "✅ Terminé" };

// Charger le nom du projet
const loadProjectTitle = async () => {
  try {
    const res = await api.get(`/projects/${projectId}`);
    projectTitle.textContent = `Tâches — ${res.data.title}`;
  } catch {
    projectTitle.textContent = "Tâches du projet";
  }
};

// Charger les tâches du projet
const loadTasks = async () => {
  try {
    const res = await api.get(`/projects/${projectId}/tasks`);
    const tasks = res.data;

    if (!tasks.length) {
      tasksList.innerHTML = "<p>Aucune tâche pour ce projet.</p>";
      return;
    }

    tasksList.innerHTML = tasks.map((task) => `
      <div class="project-item">
        <h3>${escapeHtml(task.title)}</h3>
        ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ""}

        <p>
          <strong>Priorité :</strong> ${PRIORITY_LABELS[task.priority] || task.priority} &nbsp;
          <strong>Statut :</strong> ${STATUS_LABELS[task.status] || task.status}
        </p>

        ${task.deadline ? `<p><strong>Date limite :</strong> ${new Date(task.deadline).toLocaleDateString("fr-FR")}</p>` : ""}
        ${task.assignedTo ? `<p><strong>Assigné à :</strong> ${escapeHtml(task.assignedTo.fullName)} (${escapeHtml(task.assignedTo.email)})</p>` : ""}

        <div class="project-actions">
          <!-- Changer le statut rapidement -->
          <select onchange="patchStatus('${task._id}', this.value)">
            <option value="à faire" ${task.status === "à faire" ? "selected" : ""}>À faire</option>
            <option value="en cours" ${task.status === "en cours" ? "selected" : ""}>En cours</option>
            <option value="terminé" ${task.status === "terminé" ? "selected" : ""}>Terminé</option>
          </select>

          <button onclick="editTask(
            '${task._id}',
            '${escapeAttr(task.title)}',
            '${escapeAttr(task.description || "")}',
            '${task.priority}',
            '${task.status}',
            '${task.deadline ? task.deadline.substring(0,10) : ""}'
          )">Modifier</button>

          <button onclick="deleteTask('${task._id}')">Supprimer</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    tasksList.innerHTML = "<p>Impossible de charger les tâches.</p>";
  }
};

// PATCH — mettre à jour uniquement le statut
const patchStatus = async (taskId, status) => {
  try {
    await api.patch(`/tasks/${taskId}/status`, { status });
    taskMessage.textContent = "Statut mis à jour.";
    await loadTasks();
  } catch (error) {
    taskMessage.textContent = error.response?.data?.message || "Erreur lors de la mise à jour du statut.";
  }
};

// Remplir le formulaire pour modification
const editTask = (id, title, description, priority, status, deadline) => {
  taskIdInput.value = id;
  taskTitleInput.value = title;
  taskDescriptionInput.value = description;
  taskPriorityInput.value = priority;
  taskStatusInput.value = status;
  taskDeadlineInput.value = deadline;
  submitTaskBtn.textContent = "Mettre à jour";
  cancelTaskBtn.style.display = "inline-block";
  taskFormTitle.textContent = "Modifier la tâche";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Supprimer une tâche
const deleteTask = async (id) => {
  if (!confirm("Supprimer cette tâche ?")) return;

  try {
    await api.delete(`/tasks/${id}`);
    taskMessage.textContent = "Tâche supprimée.";
    await loadTasks();
  } catch (error) {
    taskMessage.textContent = error.response?.data?.message || "Erreur lors de la suppression.";
  }
};

// Reset formulaire
const resetTaskForm = () => {
  taskIdInput.value = "";
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskPriorityInput.value = "moyenne";
  taskStatusInput.value = "à faire";
  taskDeadlineInput.value = "";
  submitTaskBtn.textContent = "Créer la tâche";
  cancelTaskBtn.style.display = "none";
  taskFormTitle.textContent = "Créer une tâche";
};

// Soumission du formulaire (créer ou modifier)
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const taskData = {
    title: taskTitleInput.value.trim(),
    description: taskDescriptionInput.value.trim(),
    priority: taskPriorityInput.value,
    status: taskStatusInput.value,
    project: projectId,
    deadline: taskDeadlineInput.value || null
  };

  try {
    const id = taskIdInput.value;

    if (id) {
      await api.put(`/tasks/${id}`, taskData);
      taskMessage.textContent = "Tâche mise à jour avec succès.";
    } else {
      await api.post("/tasks", taskData);
      taskMessage.textContent = "Tâche créée avec succès.";
    }

    resetTaskForm();
    await loadTasks();
  } catch (error) {
    taskMessage.textContent = error.response?.data?.message || "Erreur lors de l'enregistrement.";
  }
});

cancelTaskBtn.addEventListener("click", resetTaskForm);

// Utilitaires d'échappement
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(text || "")));
  return div.innerHTML;
};

const escapeAttr = (text) => {
  return String(text || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", " ");
};

// Init
loadProjectTitle();
loadTasks();
