import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Navigation, Loader2, MessageCircle, Store } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getApiErrorMessage } from '../lib/api';
import { fetchNearbySellers } from '../services/sellerService';
import type { NearbySeller } from '../types/marketplace';

const defaults = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
delete defaults._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const INDIA_CENTER: [number, number] = [20.593688, 78.962151];

function MapViewSync({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center[0], center[1], zoom, map]);
  return null;
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

const NearbySellers: React.FC = () => {
  const [sellers, setSellers] = useState<NearbySeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [geoHint, setGeoHint] = useState('');
  const [refLat, setRefLat] = useState<number | null>(null);
  const [refLng, setRefLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNearbySellers(
        refLat != null && refLng != null ? { lat: refLat, lng: refLng } : {}
      );
      setSellers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load nearby sellers.'));
    } finally {
      setLoading(false);
    }
  }, [refLat, refLng]);

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoHint('Your browser does not support location. You can still browse sellers below.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRefLat(pos.coords.latitude);
        setRefLng(pos.coords.longitude);
        setGeoHint('');
        setGeoLoading(false);
      },
      (geoErr) => {
        setGeoLoading(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setGeoHint('Location denied. Distances are hidden until you allow location or use the button below.');
        } else {
          setGeoHint('Could not read your location. You can try again below.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    setGeoHint('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRefLat(pos.coords.latitude);
        setRefLng(pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setGeoHint('Still unable to read location. Check browser permissions for this site.');
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  const plottable = useMemo(
    () => sellers.filter((s) => s.latitude != null && s.longitude != null),
    [sellers]
  );

  const mapCenter = useMemo((): [number, number] => {
    if (refLat != null && refLng != null) return [refLat, refLng];
    if (plottable.length > 0) return [plottable[0].latitude!, plottable[0].longitude!];
    return INDIA_CENTER;
  }, [refLat, refLng, plottable]);

  const mapZoom = useMemo(() => {
    if (refLat != null && refLng != null) return 12;
    if (plottable.length > 0) return 6;
    return 5;
  }, [refLat, refLng, plottable.length]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Nearby sellers
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          OpenStreetMap view of LocalConnect sellers. Allow location to sort by approximate distance.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={requestLocation}
            disabled={geoLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            Use my location
          </button>
          {refLat != null && refLng != null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              <MapPin className="h-3.5 w-3.5" />
              Location on — sorted by distance
            </span>
          ) : null}
        </div>
      </div>

      {geoHint ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {geoHint}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-700">
        <div className="relative h-[55vh] max-h-[420px] w-full min-h-[240px] sm:min-h-[320px]">
          {loading && sellers.length === 0 ? (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/80 backdrop-blur dark:bg-zinc-950/80">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
            </div>
          ) : null}
          <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" scrollWheelZoom>
            <MapViewSync center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {refLat != null && refLng != null ? (
              <CircleMarker
                center={[refLat, refLng]}
                radius={9}
                pathOptions={{
                  color: '#312e81',
                  fillColor: '#818cf8',
                  fillOpacity: 0.85,
                  weight: 2,
                }}
              >
                <Popup>You are here (approx.)</Popup>
              </CircleMarker>
            ) : null}
            {plottable.map((s) => (
              <Marker key={s._id} position={[s.latitude!, s.longitude!]}>
                <Popup>
                  <div className="min-w-[200px] space-y-2 text-zinc-900">
                    <p className="text-sm font-semibold leading-tight">{s.shopName || 'Shop'}</p>
                    <p className="text-xs text-zinc-600">{s.name}</p>
                    {s.distanceKm != null ? (
                      <p className="text-xs font-medium text-indigo-700">~{s.distanceKm} km away</p>
                    ) : (
                      <p className="text-xs text-zinc-500">Distance needs your location</p>
                    )}
                    <div className="flex flex-col gap-1.5 pt-1">
                      {digitsOnly(s.whatsappNumber).length >= 8 ? (
                        <a
                          href={`https://wa.me/${digitsOnly(s.whatsappNumber)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500">WhatsApp not set</span>
                      )}
                      <Link
                        to={`/marketplace?seller=${encodeURIComponent(s._id)}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                      >
                        <Store className="h-3.5 w-3.5" />
                        View products
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Sellers</h2>
        {loading && sellers.length === 0 ? null : sellers.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No sellers registered yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sellers.map((s) => (
              <li
                key={s._id}
                className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {s.profileImage ? (
                  <img
                    src={s.profileImage}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                    <Store className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {s.shopName || 'Shop'}
                  </p>
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{s.name}</p>
                  {(s.city || s.address || s.location) && (
                    <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-500">
                      {[s.address, s.city, s.location].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {s.distanceKm != null ? (
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">~{s.distanceKm} km</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {digitsOnly(s.whatsappNumber).length >= 8 ? (
                      <a
                        href={`https://wa.me/${digitsOnly(s.whatsappNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                    <Link
                      to={`/marketplace?seller=${encodeURIComponent(s._id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Products
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default NearbySellers;
