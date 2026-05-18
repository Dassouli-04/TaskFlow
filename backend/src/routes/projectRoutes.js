const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getTasksByProject } = require("../controllers/taskController");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  inviteMember,
  removeMember
} = require("../controllers/projectController");

const router = express.Router();

router.route("/")
  .get(protect, getProjects)
  .post(protect, createProject);

router.get("/:id/tasks", protect, getTasksByProject);
router.get("/:id/members", protect, getProjectMembers);
router.post("/:id/members", protect, inviteMember);
router.delete("/:id/members/:memberId", protect, removeMember);
router.route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;