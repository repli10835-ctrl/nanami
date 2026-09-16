/** Helpers for Google Maps points and distance calculations between coordinates. */

export type LatLng = { lat: number; lng: number };

/**
 * Extract coordinates from text: e.g. "-6.2,106.8" or Google Maps links
 * like https://maps.google.com/?q=-6.2,106.8 or .../@-6.2,106.8,17z
 */
export function parseLatLng(input: string): LatLng | null {
  if (!input) return null;
  const text = decodeURIComponent(input.trim());
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|destination|ll|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        return { lat, lng };
      }
    }
  }
  return null;
}

/** Straight line distance (km) between two coordinates. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function mapsLink(p: LatLng) {
  return `https://www.google.com/maps?q=${p.lat},${p.lng}`;
}
