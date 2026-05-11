const Task = require("../models/Task");
const Project = require("../models/Project");

const validPriorities = ["basse", "moyenne", "haute"];
const validStatuses = ["à faire", "en cours", "terminé"];

const validateTaskFields = (body) => {
  if (body.priority && !validPriorities.includes(body.priority)) {
    return "La priorité doit être : basse, moyenne ou haute";
  }

  if (body.status && !validStatuses.includes(body.status)) {
    return "Le statut doit être : à faire, en cours ou terminé";
  }

  return null;
};

const canAccessProject = (project, userId) => {
  const isOwner = project.owner.toString() === userId.toString();

  const isMember = project.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );

  return isOwner || isMember;
};

const isProjectOwner = (project, userId) => {
  return project.owner.toString() === userId.toString();
};

const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!canAccessProject(project, req.user._id)) {
      return res.status(403).json({
        message: "Accès refusé à ce projet"
      });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      project,
      assignedTo,
      deadline
    } = req.body;

    if (!title || !priority || !project) {
      return res.status(400).json({
        message: "Le titre, la priorité et le projet sont obligatoires"
      });
    }

    const validationError = validateTaskFields(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!canAccessProject(projectDoc, req.user._id)) {
      return res.status(403).json({
        message: "Accès refusé à ce projet"
      });
    }

    const task = await Task.create({
      title,
      description: description || "",
      priority,
      status: status || "à faire",
      project,
      assignedTo: assignedTo || null,
      deadline: deadline || null
    });

    await task.populate("assignedTo", "fullName email");

    return res.status(201).json({
      message: "Tâche créée avec succès",
      task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "fullName email");

    if (!task) {
      return res.status(404).json({
        message: "Tâche introuvable"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!canAccessProject(project, req.user._id)) {
      return res.status(403).json({
        message: "Accès refusé"
      });
    }

    return res.json({
      task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const validationError = validateTaskFields(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Tâche introuvable"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({
        message: "Seul le créateur du projet peut modifier complètement une tâche"
      });
    }

    const {
      title,
      description,
      priority,
      status,
      assignedTo,
      deadline
    } = req.body;

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }

    if (deadline !== undefined) {
      task.deadline = deadline || null;
    }

    await task.save();
    await task.populate("assignedTo", "fullName email");

    return res.json({
      message: "Tâche modifiée avec succès",
      task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Tâche introuvable"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({
        message: "Seul le créateur du projet peut supprimer une tâche"
      });
    }

    await task.deleteOne();

    return res.json({
      message: "Tâche supprimée avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Le statut est obligatoire"
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Statut invalide : à faire, en cours ou terminé"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Tâche introuvable"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    const isOwner = isProjectOwner(project, req.user._id);

    const isAssignedUser =
      task.assignedTo &&
      task.assignedTo.toString() === req.user._id.toString();

    if (!isOwner && !isAssignedUser) {
      return res.status(403).json({
        message: "Vous pouvez modifier uniquement vos tâches assignées"
      });
    }

    task.status = status;

    await task.save();
    await task.populate("assignedTo", "fullName email");

    return res.json({
      message: "Statut mis à jour avec succès",
      task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus
};