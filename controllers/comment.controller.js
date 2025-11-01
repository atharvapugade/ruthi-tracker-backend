// controllers/comment.controller.js
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const Joi = require('joi');
const mongoose = require('mongoose');

const commentSchema = Joi.object({
  body: Joi.string().required(),
  parent: Joi.string().allow(null, '')
});

// Add a comment to an issue
exports.addComment = async (req, res, next) => {
  try {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId))
      return res.status(400).json({ message: 'Invalid issue ID format' });

    const { error } = commentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Enforce PDF rule: Users can comment only on issues they reported.
    // Admins and Developers can comment on any issue.
    if (req.user.role === 'User' && issue.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Users can only comment on issues they reported' });
    }

    const commentData = {
      issue: issue._id,
      author: req.user._id,
      body: req.body.body,
      parent: req.body.parent && req.body.parent !== '' ? req.body.parent : null
    };

    const created = await Comment.create(commentData);

    // populate author for immediate client use
    const populated = await created.populate('author', 'name email role');

    // Log activity
    await Activity.create({
      issue: issue._id,
      actor: req.user._id,
      action: 'commented',
      details: { comment: req.body.body, parent: commentData.parent || null }
    });

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// Get all comments for an issue (threaded)
exports.getComments = async (req, res, next) => {
  try {
    const { issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId))
      return res.status(400).json({ message: 'Invalid issue ID format' });

    const comments = await Comment.find({ issue: issueId })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 })
      .lean();

    // Normalize ids to strings and create replies arrays
    const map = {};
    comments.forEach((c) => {
      const normalized = {
        ...c,
        _id: String(c._id),
        parent: c.parent ? String(c.parent) : null,
        replies: []
      };
      map[normalized._id] = normalized;
    });

    const roots = [];
    comments.forEach((c) => {
      const id = String(c._id);
      const parent = c.parent ? String(c.parent) : null;
      if (parent && map[parent]) {
        map[parent].replies.push(map[id]);
      } else {
        roots.push(map[id]);
      }
    });

    // Return an array of root comments with nested replies
    res.json(roots);
  } catch (err) {
    next(err);
  }
};
