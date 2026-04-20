const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendBulkAnnouncement, sendPasswordResetEmail } = require('../services/emailService');

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

    console.log('📝 Registration attempt:', { name, email, role });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'patient'
    });

    console.log('✅ User created:', user.email, 'ID:', user._id);

    // Create token
    const token = generateToken(user._id, user.role);

    // Send welcome email (don't fail if email service has issues)
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('📧 Welcome email sent to:', user.email);
    } catch (emailError) {
      console.warn('⚠️  Email service error:', emailError.message);
      // Continue anyway - registration should succeed even if email fails
    }

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
    console.error('❌ Registration error:', error.message);
    
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
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed. Please try again.'
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

    console.log('🔐 Login attempt:', email);

    // Check for user - case insensitive
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('👤 User found:', user ? user.email : 'Not found');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id, user.role || 'patient');

    console.log('✅ Login successful:', email);
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
    console.error('❌ Login error:', error.message);
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
    const { googleId, email, name, picture, role = 'patient' } = req.body;

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
        role: role || 'patient',
        password: undefined // No password for OAuth users
      });
      console.log(`✅ New user created via Google OAuth: ${email} (Role: ${role})`);
      
      // Send welcome email asynchronously (don't wait for it)
      sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error('Email send failed (non-blocking):', err.message);
      });
    } else if (!user.googleId) {
      // Update existing user with googleId if they don't have it
      user = await User.findByIdAndUpdate(
        user._id,
        { googleId, picture, role: role || user.role },
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

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password' });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    // Generate reset token (JWT with short expiry)
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    try {
      const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (emailError) {
      console.error('Email service error:', emailError.message);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Check your inbox.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Please provide new password' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Please provide password to confirm deletion' });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
