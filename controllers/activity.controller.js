const Activity = require('../models/Activity');

// 🔹 Fetch all activities (Admin only)
exports.getAllActivities = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Access denied' });

    const activities = await Activity.find()
      .populate('actor', 'name email role')
      .populate('issue', 'title')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    next(err);
  }
};
