// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'created_issue',
      'updated_issue',
      'assigned_issue',
      'deleted_issue',
      'commented',
      'status_changed'
    ],
    required: true,
  },
  details: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
