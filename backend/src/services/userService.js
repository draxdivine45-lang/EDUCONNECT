const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateProfile(userId, { name, bio, profilePictureUrl }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

  await user.save();
  return user;
}

module.exports = { getProfile, updateProfile };
