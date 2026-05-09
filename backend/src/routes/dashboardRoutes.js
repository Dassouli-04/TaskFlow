const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardMetrics } = require('../controllers/dashboardController');

router.get('/', protect, getDashboardMetrics);

module.exports = router;
