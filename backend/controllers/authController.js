const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dbHelpers = require('../utils/dbHelpers');

// Generate JWT Token
const generateToken = (id) => {
  console.log('Generating token for user ID:', id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = dbHelpers.findByField('users', 'email', email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await dbHelpers.hashPassword(password);

    // Create user
    const user = await dbHelpers.create('users', {
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      status: 'Active',
      avatar: '',
      department: 'General',
      phone: '',
      address: '',
      lastLogin: null,
      emailVerified: false,
      twoFactorEnabled: false
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = dbHelpers.findByField('users', 'email', email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await dbHelpers.comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Update last login
    await dbHelpers.update('users', user.id, {
      lastLogin: dbHelpers.getTimestamp()
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    const user = await dbHelpers.update('users', req.user.id, fieldsToUpdate);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await dbHelpers.comparePassword(req.body.currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await dbHelpers.hashPassword(req.body.newPassword);
    const updatedUser = await dbHelpers.update('users', req.user.id, {
      password: hashedPassword
    });

    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = dbHelpers.findByField('users', 'email', req.body.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set reset token and expiry
    await dbHelpers.update('users', user.id, {
      resetPasswordToken,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      // TODO: Send email
      console.log('Reset password email would be sent:', message);

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      await dbHelpers.update('users', user.id, {
        resetPasswordToken: null,
        resetPasswordExpire: null
      });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const users = dbHelpers.findAll('users', {
      resetPasswordToken,
      resetPasswordExpire: { $gt: new Date().toISOString() }
    });

    const user = users[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Set new password
    const hashedPassword = await dbHelpers.hashPassword(req.body.password);
    const updatedUser = await dbHelpers.update('users', user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    sendTokenResponse(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar
    }
  });
}; 