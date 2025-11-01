const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const Joi = require('joi');

// ✅ Validation schema
const issueSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  priority: Joi.string().valid('Low', 'Medium', 'High'),
  assignee: Joi.string().allow(null, ''),
  status: Joi.string().valid('Open', 'In-Progress', 'Resolved').default('Open'),
});


// 🟢 Create Issue — allowed for Admin & User
exports.createIssue = async (req, res, next) => {
  try {
    if (req.user.role === 'Developer') {
      return res.status(403).json({ message: 'Developers cannot create issues' });
    }

    const { error } = issueSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    // 🧩 Clean data: convert empty assignee to null
    const newIssueData = { ...req.body };
    if (!newIssueData.assignee || newIssueData.assignee === '') {
      newIssueData.assignee = null;
    }

    newIssueData.reporter = req.user._id;
    newIssueData.status = 'Open';

    // Users cannot assign directly
    if (req.user.role === 'User') {
      newIssueData.assignee = null;
    }

    const issue = await Issue.create(newIssueData);

    await Activity.create({
      issue: issue._id,
      actor: req.user._id,
      action: 'created_issue',
      details: { title: issue.title, priority: issue.priority },
    });

    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
};


// 🟡 Get all Issues (Search + Filter + Pagination)
exports.getIssues = async (req, res, next) => {
  try {
    const { q, status, priority } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = {};
    if (q) filter.title = new RegExp(q, 'i');
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const total = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
      .populate('reporter assignee', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      issues,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
};


// 🟠 Get single Issue
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter assignee', 'name email role');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    next(err);
  }
};


// 🔵 Update Issue (role-based logic)
exports.updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const updates = req.body;

    // 🧩 Fix: empty assignee → null
    if (updates.assignee === '') updates.assignee = null;

    // ✅ Admin — full access
    if (req.user.role === 'Admin') {
      Object.assign(issue, updates);
    }

    // ✅ Developer — only change status
    else if (req.user.role === 'Developer') {
      if ('status' in updates) issue.status = updates.status;
      else
        return res
          .status(403)
          .json({ message: 'Developers can only update status' });
    }

    // ✅ Reporter (User) — can only update their own issue (title/description)
    else if (req.user.role === 'User') {
      if (issue.reporter.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const allowed = ['title', 'description'];
      for (let key of Object.keys(updates)) {
        if (allowed.includes(key)) issue[key] = updates[key];
      }
    }
    // 🆕 Track status change specifically
if (updates.status && updates.status !== issue.status) {
  await Activity.create({
    issue: issue._id,
    actor: req.user._id,
    action: 'status_changed',
    details: { from: issue.status, to: updates.status },
  });
}


    await issue.save();

    await Activity.create({
      issue: issue._id,
      actor: req.user._id,
      action: 'updated_issue',
      details: updates,
    });

    res.json(issue);
  } catch (err) {
    next(err);
  }
};


// 🔴 Delete Issue — only Admin
exports.deleteIssue = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Only Admin can delete' });

    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await Activity.create({
      issue: issue._id,
      actor: req.user._id,
      action: 'deleted_issue',
      details: { title: issue.title },
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    next(err);
  }
};


// 🧩 Assign Issue — only Admin
exports.assignIssue = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Only Admin can assign issues' });

    const { assignee } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // 🧩 Clean: prevent invalid ObjectId cast
    issue.assignee = assignee && assignee !== '' ? assignee : null;
    await issue.save();

    await Activity.create({
      issue: issue._id,
      actor: req.user._id,
      action: 'assigned_issue',
      details: { assignee },
    });

    res.json({ message: 'Issue assigned successfully', issue });
  } catch (err) {
    next(err);
  }
};
