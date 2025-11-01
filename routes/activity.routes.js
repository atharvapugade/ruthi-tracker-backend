const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const Activity = require("../models/Activity");

// ✅ GET /api/activities — Admin only
router.get("/", authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const activities = await Activity.find()
      .populate("actor", "name email role")
      .populate("issue", "title")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
