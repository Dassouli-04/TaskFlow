const Project = require("../models/Project");
const User = require("../models/User");
const allowedStatuses = ["actif", "en pause", "archivé"];

const isProjectOwner = (project, userId) => {
  return project.owner.toString() === userId.toString();
};

const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({
        message: "Seul le créateur du projet peut retirer des membres"
      });
    }

    const isMember = project.members.some(
      (id) => id.toString() === memberId.toString()
    );

    if (!isMember) {
      return res.status(404).json({
        message: "Ce membre n'existe pas dans ce projet"
      });
    }

    project.members = project.members.filter(
      (id) => id.toString() !== memberId.toString()
    );

    await project.save();

    await project.populate("owner", "fullName email");
    await project.populate("members", "fullName email");

    return res.json({
      message: "Membre retiré avec succès",
      project
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "L'email du membre est obligatoire"
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({
        message: "Seul le créateur du projet peut inviter des membres"
      });
    }

    const userToInvite = await User.findOne({
      email: email.toLowerCase().trim()
    }).select("-password");

    if (!userToInvite) {
      return res.status(404).json({
        message: "Aucun utilisateur trouvé avec cet email"
      });
    }

    if (userToInvite._id.toString() === project.owner.toString()) {
      return res.status(400).json({
        message: "Le créateur du projet est déjà membre du projet"
      });
    }

    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userToInvite._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "Cet utilisateur est déjà membre du projet"
      });
    }

    project.members.push(userToInvite._id);
    await project.save();

    await project.populate("owner", "fullName email");
    await project.populate("members", "fullName email");

    return res.status(200).json({
      message: "Membre ajouté avec succès",
      project
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid project status"
      });
    }

    const project = await Project.create({
      title,
      description,
      deadline: deadline || null,
      status: status || "actif",
      owner: req.user._id,
      members: []
    });

    return res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create project"
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    };

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("owner", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Project.countDocuments(filter)
    ]);

    return res.json({
      data: projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load projects"
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate("owner", "fullName email")
      .populate("members", "fullName email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    return res.json({
      project
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load project"
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can update this project"
      });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid project status"
      });
    }

    if (title !== undefined) {
      project.title = title;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (deadline !== undefined) {
      project.deadline = deadline || null;
    }

    if (status !== undefined) {
      project.status = status;
    }

    await project.save();

    return res.json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update project"
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can delete this project"
      });
    }

    await project.deleteOne();

    return res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not delete project"
    });
  }
};
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "fullName email")
      .populate("members", "fullName email");

    if (!project) {
      return res.status(404).json({
        message: "Projet introuvable"
      });
    }

    const isOwner = project.owner._id.toString() === req.user._id.toString();

    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: "Accès refusé"
      });
    }

    return res.json({
      owner: project.owner,
      members: project.members
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur"
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  inviteMember,
  removeMember
};