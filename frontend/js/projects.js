const projectForm = document.getElementById("projectForm");
const projectIdInput = document.getElementById("projectId");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const deadlineInput = document.getElementById("deadline");
const statusInput = document.getElementById("status");
const submitProjectBtn = document.getElementById("submitProjectBtn");
const projectMessage = document.getElementById("projectMessage");
const projectsList = document.getElementById("projectsList");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const limit = 5;
let totalPages = 1;

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
};

const resetProjectForm = () => {
  projectIdInput.value = "";
  titleInput.value = "";
  descriptionInput.value = "";
  deadlineInput.value = "";
  statusInput.value = "actif";
  submitProjectBtn.textContent = "Create project";
};

const loadProjects = async () => {
  try {
    const response = await api.get(`/projects?page=${currentPage}&limit=${limit}`);

    const { data, page, totalPages: pages } = response.data;

    totalPages = pages || 1;
    pageInfo.textContent = `Page ${page} of ${totalPages}`;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    if (!data.length) {
      projectsList.innerHTML = "<p>No projects found.</p>";
      return;
    }

    projectsList.innerHTML = data.map((project) => `
      <div class="project-item">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Deadline:</strong> ${formatDate(project.deadline)}</p>
        <p><strong>Owner:</strong> ${project.owner?.fullName || "Unknown"}</p>

        <div class="project-actions">
          <button onclick="editProject('${project._id}', '${escapeText(project.title)}', '${escapeText(project.description)}', '${project.deadline || ""}', '${project.status}')">
            Edit
          </button>

          <button onclick="deleteProject('${project._id}')">
            Delete
          </button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    projectsList.innerHTML = "<p>Could not load projects.</p>";
  }
};

const escapeText = (text) => {
  return String(text || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", " ");
};

const editProject = (id, title, description, deadline, status) => {
  projectIdInput.value = id;
  titleInput.value = title;
  descriptionInput.value = description;

  if (deadline) {
    deadlineInput.value = deadline.substring(0, 10);
  } else {
    deadlineInput.value = "";
  }

  statusInput.value = status;
  submitProjectBtn.textContent = "Update project";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const deleteProject = async (id) => {
  const confirmed = confirm("Are you sure you want to delete this project?");

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/projects/${id}`);

    projectMessage.textContent = "Project deleted successfully";
    await loadProjects();
  } catch (error) {
    projectMessage.textContent =
      error.response?.data?.message || "Could not delete project";
  }
};

if (projectForm) {
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectData = {
      title: titleInput.value,
      description: descriptionInput.value,
      deadline: deadlineInput.value || null,
      status: statusInput.value
    };

    try {
      const projectId = projectIdInput.value;

      if (projectId) {
        await api.put(`/projects/${projectId}`, projectData);
        projectMessage.textContent = "Project updated successfully";
      } else {
        await api.post("/projects", projectData);
        projectMessage.textContent = "Project created successfully";
      }

      resetProjectForm();
      await loadProjects();
    } catch (error) {
      projectMessage.textContent =
        error.response?.data?.message || "Could not save project";
    }
  });
}

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", async () => {
    if (currentPage > 1) {
      currentPage--;
      await loadProjects();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", async () => {
    if (currentPage < totalPages) {
      currentPage++;
      await loadProjects();
    }
  });
}

loadProjects();