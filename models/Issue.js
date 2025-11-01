const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Open', 'In-Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
