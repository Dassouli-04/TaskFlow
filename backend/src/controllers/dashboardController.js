const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const today = new Date();

    const activeProjectsResult = await Project.aggregate([
      {
        $match: {
          status: "actif",
          $or: [
            { owner: userObjectId },
            { members: userObjectId }
          ]
        }
      },
      {
        $count: "total"
      }
    ]);

    const assignedTasksResult = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId
        }
      },
      {
        $count: "total"
      }
    ]);

    const completedTasksResult = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          status: "terminé"
        }
      },
      {
        $count: "total"
      }
    ]);

    const lateTasksResult = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          deadline: { $lt: today },
          status: { $ne: "terminé" }
        }
      },
      {
        $count: "total"
      }
    ]);

    const priorityOrder = {
      haute: 3,
      moyenne: 2,
      basse: 1
    };

    const currentTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: "terminé" }
    })
      .populate("project", "title status deadline")
      .populate("assignedTo", "fullName email")
      .lean();

    currentTasks.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const dateA = a.deadline ? new Date(a.deadline) : new Date("9999-12-31");
      const dateB = b.deadline ? new Date(b.deadline) : new Date("9999-12-31");

      return dateA - dateB;
    });

    return res.json({
      activeProjectsCount: activeProjectsResult[0]?.total || 0,
      assignedTasksCount: assignedTasksResult[0]?.total || 0,
      completedTasksCount: completedTasksResult[0]?.total || 0,
      lateTasksCount: lateTasksResult[0]?.total || 0,
      currentTasks
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

module.exports = {
  getDashboard
};