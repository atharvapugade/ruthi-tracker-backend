const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validation/auth.validation');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: generate token
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Register
exports.register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

  const { name, email, password, role } = req.body;

    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

   const user = await User.create({ name, email, password, role });
 const token = generateToken(user._id);

    res.json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
};


