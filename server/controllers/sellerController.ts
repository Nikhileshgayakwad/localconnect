import { Request, Response } from 'express';
import Seller from '../models/Seller.js';
import User from '../models/User.js';
import { haversineKm } from '../utils/geo.js';

interface NearbySellerRow {
  _id: string;
  name: string;
  shopName: string;
  profileImage: string;
  location: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  whatsappNumber: string;
  distanceKm: number | null;
}

export const getSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 6;
    const sellers = await Seller.find().sort({ followers: -1, createdAt: -1 }).limit(Math.min(limit, 20));

    res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNearbySellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = Number.parseFloat(String(req.query.lat ?? ''));
    const lng = Number.parseFloat(String(req.query.lng ?? ''));
    const hasRef = Number.isFinite(lat) && Number.isFinite(lng);

    const raw = await User.find({ role: 'seller' })
      .select('name shopName profileImage avatar location city address latitude longitude whatsappNumber')
      .lean();

    const data: NearbySellerRow[] = raw.map((s: any) => {
      const profileImage = (s.profileImage || s.avatar || '') as string;
      let distanceKm: number | null = null;
      const slat = s.latitude;
      const slng = s.longitude;
      if (
        hasRef &&
        typeof slat === 'number' &&
        typeof slng === 'number' &&
        Number.isFinite(slat) &&
        Number.isFinite(slng)
      ) {
        distanceKm = Math.round(haversineKm(lat, lng, slat, slng) * 100) / 100;
      }
      return {
        _id: String(s._id),
        name: s.name || '',
        shopName: s.shopName || '',
        profileImage,
        location: s.location || '',
        city: s.city || '',
        address: s.address || '',
        latitude: typeof slat === 'number' && Number.isFinite(slat) ? slat : null,
        longitude: typeof slng === 'number' && Number.isFinite(slng) ? slng : null,
        whatsappNumber: s.whatsappNumber || '',
        distanceKm,
      };
    });

    if (hasRef) {
      data.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return a.name.localeCompare(b.name);
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSellerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerName = (req.params.name || '').trim();

    if (!sellerName) {
      res.status(400).json({ success: false, error: 'Seller name is required' });
      return;
    }

    const seller = await Seller.findOne({ name: { $regex: `^${sellerName}$`, $options: 'i' } });

    if (!seller) {
      res.status(404).json({ success: false, error: 'Seller profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
