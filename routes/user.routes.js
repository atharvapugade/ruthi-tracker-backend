const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth.middleware');
const { getDevelopers } = require('../controllers/user.controller');

// Apply authentication middleware
router.use(authenticate);

// 🧩 Only Admins can access this route
router.get('/developers', getDevelopers);

module.exports = router;
