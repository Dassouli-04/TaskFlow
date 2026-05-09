const Project = require('../models/Project');
const Task = require('../models/Task');

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Nombre de projets actifs (où l'utilisateur est owner ou member)
    const activeProjects = await Project.countDocuments({
      $or: [
        { owner: userId },
        { members: userId }
      ],
      status: 'actif'
    });

    // Tâches assignées à l'utilisateur
    const assignedTasks = await Task.find({ assignedTo: userId });

    const totalAssigned = assignedTasks.length;
    const completedTasks = assignedTasks.filter(t => t.status === 'terminé').length;
    
    // Tâches en retard (deadline dépassée et status != terminé)
    const today = new Date();
    const lateTasks = assignedTasks.filter(t => 
      t.deadline && new Date(t.deadline) < today && t.status !== 'terminé'
    ).length;

    // Tâches en cours triées par priorité (haute → moyenne → basse) et deadline
    const pendingTasks = assignedTasks
      .filter(t => t.status === 'en cours')
      .sort((a, b) => {
        const priorityOrder = { haute: 3, moyenne: 2, basse: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.deadline) - new Date(b.deadline);
      })
      .slice(0, 5); // Dernières 5 tâches

    res.json({
      activeProjects,
      totalAssigned,
      completedTasks,
      lateTasks,
      pendingTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardMetrics };