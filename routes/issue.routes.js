const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const issueController = require('../controllers/issue.controller');

// Auth required for all issue routes
router.use(authenticate);

router.post('/', issueController.createIssue);     // create
router.get('/', issueController.getIssues);        // list
router.get('/:id', issueController.getIssue);      // get single
router.put('/:id', issueController.updateIssue);   // update
router.delete('/:id', issueController.deleteIssue);// delete

module.exports = router;
