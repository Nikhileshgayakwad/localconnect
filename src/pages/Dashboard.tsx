import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Users, Calendar, Activity, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '../lib/api';
import { reverseGeocodeSellerLocation } from '../lib/osmReverseGeocode';
import { uploadImageFile } from '../services/uploadService';

const Dashboard: React.FC = () => {
  const { user, setUser } = useAuth();
  const mapUpdatedUser = (updatedUser: any) =>
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
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          latitude: updatedUser.latitude ?? null,
          longitude: updatedUser.longitude ?? null,
          profileImage: updatedUser.profileImage || '',
        }
      : user;

  const [profileImageDraft, setProfileImageDraft] = React.useState(user?.profileImage || user?.avatar || '');
  const [profileUploading, setProfileUploading] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState('');
  const [sellerProfile, setSellerProfile] = React.useState({
    shopName: user?.shopName || '',
    whatsappNumber: user?.whatsappNumber || '',
    location: user?.location || '',
    address: user?.address || '',
    city: user?.city || '',
    latitude:
      user?.latitude != null && Number.isFinite(Number(user.latitude)) ? String(user.latitude) : '',
    longitude:
      user?.longitude != null && Number.isFinite(Number(user.longitude)) ? String(user.longitude) : '',
    profileImage: user?.profileImage || '',
  });
  const [saving, setSaving] = React.useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');
  const [sellerGeoLoading, setSellerGeoLoading] = React.useState(false);
  const [sellerGeoError, setSellerGeoError] = React.useState('');
  const [sellerGeoInfo, setSellerGeoInfo] = React.useState('');

  React.useEffect(() => {
    setProfileImageDraft(user?.profileImage || user?.avatar || '');
    setSellerProfile({
      shopName: user?.shopName || '',
      whatsappNumber: user?.whatsappNumber || '',
      location: user?.location || '',
      address: user?.address || '',
      city: user?.city || '',
      latitude:
        user?.latitude != null && Number.isFinite(Number(user.latitude)) ? String(user.latitude) : '',
      longitude:
        user?.longitude != null && Number.isFinite(Number(user.longitude)) ? String(user.longitude) : '',
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
      setUser(mapUpdatedUser(updatedUser));
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
      setUser(mapUpdatedUser(updatedUser));
      setSaveMessage('Seller profile updated successfully.');
      setSellerGeoError('');
      setSellerGeoInfo('');
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error, 'Unable to update seller profile.'));
    } finally {
      setSaving(false);
    }
  };

  const geolocationFailureMessage = (code: number) => {
    switch (code) {
      case 1:
        return 'Location permission was denied. Allow access for this site or enter coordinates manually.';
      case 2:
        return 'Your position could not be determined. Try again or enter coordinates manually.';
      case 3:
        return 'Location request timed out. Try again or enter coordinates manually.';
      default:
        return 'Could not read your location. Try again or enter coordinates manually.';
    }
  };

  const fillSellerLocationFromBrowser = () => {
    setSellerGeoError('');
    setSellerGeoInfo('');
    if (!navigator.geolocation) {
      setSellerGeoError('Geolocation is not supported in this browser. Enter latitude and longitude manually.');
      return;
    }
    setSellerGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latStr = String(Math.round(lat * 1e6) / 1e6);
        const lngStr = String(Math.round(lng * 1e6) / 1e6);

        let rev: Awaited<ReturnType<typeof reverseGeocodeSellerLocation>> = null;
        const ctrl = new AbortController();
        const timer = window.setTimeout(() => ctrl.abort(), 12_000);
        try {
          rev = await reverseGeocodeSellerLocation(lat, lng, ctrl.signal);
        } catch {
          rev = null;
        } finally {
          window.clearTimeout(timer);
        }

        setSellerProfile((prev) => {
          const next = { ...prev, latitude: latStr, longitude: lngStr };
          if (rev) {
            if (rev.city) next.city = rev.city;
            if (rev.location) next.location = rev.location;
            if (rev.address) next.address = rev.address;
          }
          return next;
        });

        setSellerGeoLoading(false);
        if (rev) {
          setSellerGeoInfo('Location filled from your device and OpenStreetMap lookup.');
        } else {
          setSellerGeoInfo(
            'Coordinates filled from your device. City or address could not be looked up — edit those fields if needed, then save.'
          );
        }
      },
      (geoErr) => {
        setSellerGeoLoading(false);
        setSellerGeoError(geolocationFailureMessage(geoErr.code));
      },
      { enableHighAccuracy: true, timeout: 22_000, maximumAge: 0 }
    );
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
                placeholder="Location (area / region)"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={sellerProfile.city}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <textarea
                value={sellerProfile.address}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Street address (shown on nearby map cards)"
                rows={2}
                className="sm:col-span-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <div className="sm:col-span-2 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Map position
                  </span>
                  <button
                    type="button"
                    onClick={fillSellerLocationFromBrowser}
                    disabled={sellerGeoLoading || saving || uploadingProfileImage}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {sellerGeoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Navigation className="h-4 w-4" aria-hidden />
                    )}
                    {sellerGeoLoading ? 'Getting location…' : 'Use current location'}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Uses your browser location, then tries to fill city and address from OpenStreetMap. You can still edit
                  every field before saving.
                </p>
                {sellerGeoError ? (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{sellerGeoError}</p>
                ) : null}
                {sellerGeoInfo ? (
                  <p className="text-sm text-emerald-800 dark:text-emerald-300/90">{sellerGeoInfo}</p>
                ) : null}
              </div>
              <input
                value={sellerProfile.latitude}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder="Latitude (decimal, e.g. 26.9124)"
                inputMode="decimal"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={sellerProfile.longitude}
                onChange={(e) => setSellerProfile((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder="Longitude (decimal, e.g. 75.7873)"
                inputMode="decimal"
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
