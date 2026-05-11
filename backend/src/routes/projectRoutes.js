const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getTasksByProject } = require("../controllers/taskController");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const router = express.Router();

router.route("/")
  .get(protect, getProjects)
  .post(protect, createProject);

router.get("/:id/tasks", protect, getTasksByProject);

router.route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;