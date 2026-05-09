const Project = require("../models/Project");

const allowedStatuses = ["actif", "en pause", "archivé"];

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

    return res.json(project);
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
// 4 

// GET /api/projects/:id/members
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    
    // Vérifier que l'utilisateur est membre ou owner
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    res.json({
      owner: project.owner,
      members: project.members
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
/////4
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      assignedTo,
      search 
    } = req.query;

    // Construire le filtre
    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);

    res.json({
      data: tasks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/////////////////////
// Ajouter un membre par email
const addMemberByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    // Seul le créateur peut ajouter des membres
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le créateur peut ajouter des membres' });
    }
    
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'Utilisateur non trouvé avec cet email' });
    }
    
    // Vérifier si déjà membre
    if (project.members.includes(userToAdd._id) || project.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà membre ou créateur' });
    }
    
    project.members.push(userToAdd._id);
    await project.save();
    
    res.json({ message: 'Membre ajouté avec succès', member: userToAdd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retirer un membre
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le créateur peut retirer des membres' });
    }
    
    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();
    
    res.json({ message: 'Membre retiré avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//////////////////
module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  getTasksByProject,
  addMemberByEmail
};


