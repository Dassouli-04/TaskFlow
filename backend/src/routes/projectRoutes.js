const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const { getTasksByProject } = require("../controllers/taskcontroller");

const router = express.Router();

router.route("/")
  .get(protect, getProjects)
  .post(protect, createProject);

router.route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route("/:id/tasks")
  .get(protect, getTasksByProject);

module.exports = router;

////// 4

