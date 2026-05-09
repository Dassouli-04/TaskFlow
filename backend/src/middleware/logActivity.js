const Activity = require('../models/Activity');

const logActivity = async (projectId, userId, action, details = '') => {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };