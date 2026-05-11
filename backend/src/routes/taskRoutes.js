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

router.post("/", protect, createTask);

router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch("/:id/status", protect, updateTaskStatus);

module.exports = router;