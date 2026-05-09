const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
} = require("../controllers/taskcontroller");

const router = express.Router();

router.route("/")
  .post(protect, createTask);

router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route("/:id/status")
  .patch(protect, updateTaskStatus);

module.exports = router;
/// 4
