const asyncHandler = require('../utils/asyncHandler');
const { requireFields, isValidEmail, isNonEmptyString } = require('../utils/validators');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body;
  requireFields(req.body, ['username', 'email', 'password']);

  if (!isValidEmail(email)) throw ApiError.badRequest('Invalid email address');
  if (!isNonEmptyString(username) || username.trim().length < 3) {
    throw ApiError.badRequest('Username must be at least 3 characters');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters');
  }

  const { user, token } = await authService.register({ username, email, password, name });
  res.status(201).json({ success: true, data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  requireFields(req.body, ['email', 'password']);

  const { user, token } = await authService.login({ email, password });
  res.status(200).json({ success: true, data: { user, token } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  requireFields(req.body, ['currentPassword', 'newPassword']);

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  await authService.changePassword(req.user._id, currentPassword, newPassword);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, changePassword };
