const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, contact, homeLocation } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      contact: contact || '',
      homeLocation: homeLocation || '',
      preferredUpazilas: [],      // default empty array
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (cookie required)
exports.refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ msg: 'Invalid refresh token' });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(403).json({ msg: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(403).json({ msg: 'Invalid refresh token' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// In authController.js updateProfile
exports.updateProfile = async (req, res) => {
  const { name, contact, homeLocation, preferredUpazilas, alertPreferences } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const oldUpazilas = user.preferredUpazilas || [];

    if (name !== undefined) user.name = name;
    if (contact !== undefined) user.contact = contact;
    if (homeLocation !== undefined) user.homeLocation = homeLocation;
    let newUpazilas = preferredUpazilas;
    if (preferredUpazilas !== undefined) {
      user.preferredUpazilas = preferredUpazilas;
      newUpazilas = preferredUpazilas;
    }
    if (alertPreferences) user.alertPreferences = alertPreferences;

    await user.save();

    // For each newly added upazila, send existing active alerts
    if (Array.isArray(newUpazilas)) {
      const added = newUpazilas.filter(upa => !oldUpazilas.includes(upa));
      if (added.length > 0) {
        const { sendExistingAlertsForUpazila } = require('../services/alertService');
        for (const upa of added) {
          await sendExistingAlertsForUpazila(user, upa);
        }
      }
    }

    const sanitizedUser = await User.findById(req.user.id).select('-password -refreshToken');
    res.json({ msg: 'Profile updated', user: sanitizedUser });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message });
  }
};