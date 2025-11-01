const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth.middleware');
const commentController = require('../controllers/comment.controller');

router.use(authenticate);
router.post('/', commentController.addComment);
router.get('/', commentController.getComments);

module.exports = router;
