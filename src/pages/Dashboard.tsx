import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Users, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '../lib/api';
import { uploadImageFile } from '../services/uploadService';

const Dashboard: React.FC = () => {
  const { user, setUser } = useAuth();
  const [profileImageDraft, setProfileImageDraft] = React.useState(user?.profileImage || user?.avatar || '');
  const [profileUploading, setProfileUploading] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState('');
  const [sellerProfile, setSellerProfile] = React.useState({
    shopName: user?.shopName || '',
    whatsappNumber: user?.whatsappNumber || '',
    location: user?.location || '',
    profileImage: user?.profileImage || '',
  });
  const [saving, setSaving] = React.useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');

  React.useEffect(() => {
    setProfileImageDraft(user?.profileImage || user?.avatar || '');
    setSellerProfile({
      shopName: user?.shopName || '',
      whatsappNumber: user?.whatsappNumber || '',
      location: user?.location || '',
      profileImage: user?.profileImage || '',
    });
  }, [user]);

  const saveProfilePhoto = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage('');
    setProfileSaving(true);
    try {
      const response = await apiClient.put('/api/auth/me', {
        profileImage: profileImageDraft,
      });
      const updatedUser = response.data?.data;
      setUser(
        updatedUser
          ? {
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role === 'seller' ? 'seller' : 'buyer',
              avatar: updatedUser.avatar,
              shopName: updatedUser.shopName || '',
              whatsappNumber: updatedUser.whatsappNumber || '',
              location: updatedUser.location || '',
              profileImage: updatedUser.profileImage || '',
            }
          : user
      );
      setProfileMessage('Profile photo updated successfully.');
    } catch (error) {
      setProfileMessage(getApiErrorMessage(error, 'Unable to update profile photo.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMessage('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage('Image must be 5MB or smaller.');
      return;
    }

    setProfileMessage('');
    setProfileUploading(true);
    try {
      const { uploadImageFile } = await import('../services/uploadService');
      const imageUrl = await uploadImageFile(file);
      setProfileImageDraft(imageUrl);
    } catch (error) {
      setProfileMessage(getApiErrorMessage(error, 'Profile image upload failed.'));
    } finally {
      setProfileUploading(false);
      event.target.value = '';
    }
  };

  const saveSellerProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveMessage('');
    setSaving(true);
    try {
      const response = await apiClient.put('/api/auth/me', sellerProfile);
      const updatedUser = response.data?.data;
      setUser(
        updatedUser
          ? {
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role === 'seller' ? 'seller' : 'buyer',
              avatar: updatedUser.avatar,
              shopName: updatedUser.shopName || '',
              whatsappNumber: updatedUser.whatsappNumber || '',
              location: updatedUser.location || '',
              profileImage: updatedUser.profileImage || '',
            }
          : user
      );
      setSaveMessage('Seller profile updated successfully.');
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error, 'Unable to update seller profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveMessage('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage('Image must be 5MB or smaller.');
      return;
    }

    setSaveMessage('');
    setUploadingProfileImage(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setSellerProfile((prev) => ({ ...prev, profileImage: imageUrl }));
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error, 'Profile image upload failed.'));
    } finally {
      setUploadingProfileImage(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              <p className="text-gray-500">Manage your local e-commerce activity from here.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                  <ShoppingBag className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Listings</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Connections</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">0</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">Name</span>
                <span className="text-sm text-gray-900">{user?.name}</span>
              </div>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">Email</span>
                <span className="text-sm text-gray-900">{user?.email}</span>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">Account ID</span>
                <span className="text-sm text-gray-500 font-mono">{user?._id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-sm border border-gray-200 rounded-lg p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-zinc-100">Profile Photo</h2>
          <form onSubmit={saveProfilePhoto} className="space-y-3">
            {profileImageDraft ? (
              <img
                src={profileImageDraft}
                alt="Profile preview"
                className="h-28 w-28 rounded-full border border-gray-200 object-cover dark:border-zinc-700"
              />
            ) : (
              <div className="h-28 w-28 rounded-full border border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800" />
            )}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Change Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
              />
              <input
                value={profileImageDraft}
                onChange={(e) => setProfileImageDraft(e.target.value)}
                placeholder="Profile image URL (optional fallback)"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={profileSaving || profileUploading}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
              >
                {profileUploading ? 'Uploading...' : profileSaving ? 'Saving...' : 'Save profile photo'}
              </button>
              {profileMessage ? <p className="text-sm text-zinc-600 dark:text-zinc-300">{profileMessage}</p> : null}
            </div>
          </form>
        </div>

        {user?.role === 'seller' ? (
          <div className="mt-8 bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Seller Profile</h2>
            <form onSubmit={saveSellerProfile} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={sellerProfile.shopName}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, shopName: e.target.value }))}
                placeholder="Shop name"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={sellerProfile.whatsappNumber}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="WhatsApp number"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={sellerProfile.location}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Location"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={sellerProfile.profileImage}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, profileImage: e.target.value }))}
                placeholder="Profile image URL"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Upload profile image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Only image files up to 5MB are allowed.</p>
              </div>
              {sellerProfile.profileImage ? (
                <img
                  src={sellerProfile.profileImage}
                  alt="Seller profile preview"
                  className="sm:col-span-2 h-40 w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
                />
              ) : null}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || uploadingProfileImage}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
                >
                  {uploadingProfileImage ? 'Uploading image...' : saving ? 'Saving...' : 'Save seller profile'}
                </button>
                {saveMessage ? <p className="text-sm text-zinc-600 dark:text-zinc-300">{saveMessage}</p> : null}
              </div>
            </form>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default Dashboard;
