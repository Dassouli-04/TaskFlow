const Activity = require('../models/Activity');

const getProjectActivities = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activities = await Activity.find({ project: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjectActivities };