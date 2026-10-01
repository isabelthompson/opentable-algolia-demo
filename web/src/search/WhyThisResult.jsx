// Explains in plain words why Algolia ranked this restaurant here
export function WhyThisResult({ hit }) {
  const info = hit._rankingInfo;
  if (!info) return null;

  const matchedIn = Object.entries(hit._highlightResult || {})
    .filter(([, value]) => JSON.stringify(value).includes('"matchLevel":"full"') ||
      JSON.stringify(value).includes('"matchLevel":"partial"'))
    .map(([attribute]) => attribute);

  return (
    <ul className="why">
      <li><strong>Typos:</strong> {info.nbTypos === 0 ? 'exact match' : `${info.nbTypos} typo(s) forgiven`}</li>
      {matchedIn.length > 0 && <li><strong>Matched in:</strong> {matchedIn.join(', ')}</li>}
      {info.geoDistance !== undefined && (
        <li><strong>Distance:</strong> within {Math.round((info.geoDistance + 8000) / 1609)} mi (grouped, so rating decides the order)</li>
      )}
      <li><strong>Tie-breaker:</strong> {hit.stars_count} stars, {hit.reviews_count} reviews</li>
    </ul>
  );
}
