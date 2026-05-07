const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require("../controllers/taskController");

const router = express.Router();

// CRUD classique sur /api/tasks
router.route("/")
  .post(protect, createTask);

router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// PATCH — mise à jour du statut uniquement
router.route("/:id/status")
  .patch(protect, updateTaskStatus);

module.exports = router;
