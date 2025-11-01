const User = require('../models/User');

// ✅ Get all Developers (for assigning issues)
exports.getDevelopers = async (req, res, next) => {
  try {
    // Only Admin can see developers
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin can view developers' });
    }

    // Fetch developers
    const developers = await User.find({ role: 'Developer' }).select('name email _id');

    res.json(developers);
  } catch (err) {
    next(err);
  }
};
