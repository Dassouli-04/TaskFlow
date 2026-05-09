const Task = require("../models/Task");
const Project = require("../models/Project");

// Middleware de validation des champs enum
const validateTaskFields = (body) => {
  const validPriorities = ["basse", "moyenne", "haute"];
  const validStatuses = ["à faire", "en cours", "terminé"];

  if (body.priority && !validPriorities.includes(body.priority)) {
    return "La priorité doit être : basse, moyenne ou haute";
  }

  if (body.status && !validStatuses.includes(body.status)) {
    return "Le statut doit être : à faire, en cours ou terminé";
  }

  return null;
};

// GET /api/projects/:id/tasks — toutes les tâches d'un projet
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    // Vérifier que l'utilisateur est owner ou member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé à ce projet" });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// POST /api/tasks — créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, project, assignedTo, deadline } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Le titre et le projet sont obligatoires" });
    }

    const validationError = validateTaskFields(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé à ce projet" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      project,
      assignedTo: assignedTo || null,
      deadline: deadline || null
    });

    const populated = await task.populate("assignedTo", "fullName email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// GET /api/tasks/:id — une tâche
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "fullName email");

    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// PUT /api/tasks/:id — modifier une tâche
const updateTask = async (req, res) => {
  try {
    const validationError = validateTaskFields(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { title, description, priority, status, assignedTo, deadline } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    task.deadline = deadline !== undefined ? deadline : task.deadline;

    await task.save();
    await task.populate("assignedTo", "fullName email");

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// DELETE /api/tasks/:id — supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: "Seul le créateur peut supprimer une tâche" });
    }

    await task.deleteOne();

    res.json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// PATCH /api/tasks/:id/status — mettre à jour uniquement le statut
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Le statut est obligatoire" });
    }

    const validStatuses = ["à faire", "en cours", "terminé"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide : à faire, en cours ou terminé" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    task.status = status;
    await task.save();

    res.json({ message: "Statut mis à jour", task });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

///////////////////////////////
const getMyTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
////////////////////////////////

module.exports = {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks
};
