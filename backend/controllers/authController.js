const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendBulkAnnouncement } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role: role || 'patient' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient'
    });

    // Create token
    const token = generateToken(user._id, user.role);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        role: user.role,
        patientId: user.patientId
      }
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({
          success: false,
          error: 'Email ID already exists. Please use a different email.'
        });
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id, user.role || 'patient');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        role: user.role || 'patient',
        patientId: user.patientId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user language preference
// @route   PUT /api/auth/language
// @access  Private
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { language },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        picture,
        role: 'patient',
        password: undefined // No password for OAuth users
      });
      console.log(`✅ New user created via Google OAuth: ${email}`);
      // Send welcome email for new users
      await sendWelcomeEmail(user.email, user.name);
    } else if (!user.googleId) {
      // Update existing user with googleId if they don't have it
      user = await User.findByIdAndUpdate(
        user._id,
        { googleId, picture },
        { new: true }
      );
      console.log(`✅ User updated with Google OAuth: ${email}`);
    }

    // Generate token
    const token = generateToken(user._id, user.role || 'patient');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        language: user.language,
        role: user.role || 'patient',
        patientId: user.patientId
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Google authentication failed'
    });
  }
};

// @desc    Send bulk announcement to users
// @route   POST /api/auth/send-announcement
// @access  Private (Admin/Doctor only)
exports.sendAnnouncement = async (req, res) => {
  try {
    const { subject, message, role } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Find users to send to
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query, 'email name');
    const recipientEmails = users.map(u => u.email);

    if (recipientEmails.length === 0) {
      return res.status(400).json({ error: 'No recipients found' });
    }

    // Send emails
    const htmlContent = `<p>${message.replace(/\n/g, '<br>')}</p>`;
    const result = await sendBulkAnnouncement(subject, htmlContent, recipientEmails);

    res.status(200).json({
      success: true,
      message: `Announcement sent to ${result.sent} users`,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Announcement Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
