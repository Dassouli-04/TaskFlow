const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProjectActivities } = require('../controllers/activityController');

router.get('/projects/:id/activities', protect, getProjectActivities);

module.exports = router;