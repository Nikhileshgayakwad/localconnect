/** City / region / street line derived from Nominatim reverse (OpenStreetMap). */

export interface SellerLocationFromGeo {
  city: string;
  location: string;
  address: string;
}

function pickCity(a: Record<string, string>): string {
  return (
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.suburb ||
    a.hamlet ||
    ''
  );
}

function buildStreetLine(a: Record<string, string>): string {
  const road = [a.house_number, a.road].filter(Boolean).join(' ').trim();
  if (road) return road;
  return [a.neighbourhood, a.quarter, a.suburb].filter(Boolean).join(', ');
}

function buildLocationLine(city: string, a: Record<string, string>): string {
  const state = a.state || a.region || '';
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return a.country || '';
}

/**
 * Reverse-geocode coordinates using the public Nominatim API.
 * Respect OSM usage policy: only call after an explicit user action, debounce in UI if needed.
 */
export async function reverseGeocodeSellerLocation(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<SellerLocationFromGeo | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '18');

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { address?: Record<string, string> };
  const a = data.address;
  if (!a || typeof a !== 'object') return null;

  const city = pickCity(a);
  const address = buildStreetLine(a);
  const location = buildLocationLine(city, a);

  return {
    city,
    location,
    address,
  };
}
