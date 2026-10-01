// Straight-line distance in miles between two points (haversine formula).
// Algolia rounds geoDistance to aroundPrecision for ranking, so the card computes the real distance itself.
export function milesBetween(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

export function parseLatLng(latLng) {
  if (!latLng) return null;
  const [lat, lng] = latLng.split(',').map(Number);
  return { lat, lng };
}
