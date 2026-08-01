import { useState } from 'react';
import { updateMe } from '../api/users';
import { changePasswordRequest } from '../api/auth';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePictureUrl: user?.profilePictureUrl || '',
  });
  const [profileStatus, setProfileStatus] = useState({ error: '', success: '', saving: false });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', saving: false });

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileStatus({ error: '', success: '', saving: true });
    try {
      const updatedUser = await updateMe(profileForm);
      updateStoredUser(updatedUser);
      setProfileStatus({ error: '', success: 'Profile updated successfully.', saving: false });
    } catch (err) {
      setProfileStatus({ error: extractErrorMessage(err), success: '', saving: false });
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters.', success: '', saving: false });
      return;
    }

    setPasswordStatus({ error: '', success: '', saving: true });
    try {
      await changePasswordRequest(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordStatus({ error: '', success: 'Password changed successfully.', saving: false });
    } catch (err) {
      setPasswordStatus({ error: extractErrorMessage(err), success: '', saving: false });
    }
  }

  return (
    <div className="page profile-page">
      <h1>Profile</h1>

      <section className="profile-section">
        <h2>Account details</h2>
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>

        <form onSubmit={handleProfileSubmit} className="profile-form">
          {profileStatus.error && <p className="form-error">{profileStatus.error}</p>}
          {profileStatus.success && <p className="form-success">{profileStatus.success}</p>}

          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />

          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            rows={4}
            maxLength={1000}
          />

          <label htmlFor="profilePictureUrl">Profile picture URL</label>
          <input
            id="profilePictureUrl"
            type="url"
            value={profileForm.profilePictureUrl}
            onChange={(e) => setProfileForm({ ...profileForm, profilePictureUrl: e.target.value })}
          />

          <button type="submit" className="btn btn-primary" disabled={profileStatus.saving}>
            {profileStatus.saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="profile-form">
          {passwordStatus.error && <p className="form-error">{passwordStatus.error}</p>}
          {passwordStatus.success && <p className="form-success">{passwordStatus.success}</p>}

          <label htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />

          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />

          <button type="submit" className="btn btn-primary" disabled={passwordStatus.saving}>
            {passwordStatus.saving ? 'Updating...' : 'Change password'}
          </button>
        </form>
      </section>
    </div>
  );
}
