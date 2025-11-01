require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB(process.env.MONGO_URI);


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/issues', require('./routes/issue.routes'));
app.use('/api/issues/:issueId/comments', require('./routes/comment.routes'));
app.use('/api/activities', require('./routes/activity.routes'));
app.use('/api/users', require('./routes/user.routes'));


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));
