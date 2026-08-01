const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(200).json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, profilePictureUrl } = req.body;
  const user = await userService.updateProfile(req.user._id, { name, bio, profilePictureUrl });
  res.status(200).json({ success: true, data: user });
});

module.exports = { getMe, updateMe };
