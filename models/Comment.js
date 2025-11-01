const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
