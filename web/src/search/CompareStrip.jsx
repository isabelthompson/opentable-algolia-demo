import { useEffect, useState } from 'react';
import { useInstantSearch } from 'react-instantsearch';
import { searchClient, INDEXES } from './searchClient';
import { basicSearchClient } from './basicSearchClient';

// Runs the current search on both sides (basic search vs Algolia) and shows the numbers side by side.
// Nothing is hard-coded: every figure comes from Algolia's response.
function paramsFromUiState(state) {
  const facetFilters = Object.entries(state.refinementList || {})
    .filter(([, values]) => values?.length)
    .map(([attribute, values]) => values.map((v) => `${attribute}:${v}`));
  const numericFilters = [];
  const stars = state.numericMenu?.stars_count;
  if (stars) {
    const [start, end] = stars.split(':');
    if (start) numericFilters.push(`stars_count>=${start}`);
    if (end) numericFilters.push(`stars_count<=${end}`);
  }
  return { query: state.query || '', facetFilters, numericFilters, hitsPerPage: 1, facets: ['cuisine_group'], maxValuesPerFacet: 1000 };
}

export function CompareStrip({ mode, onModeChange, location, scenario, onClose }) {
  const { indexUiState } = useInstantSearch();
  const [stats, setStats] = useState(null);
  // Notes explain each scenario for whoever opens the demo alone; turn them off to present live
  const [showNotes, setShowNotes] = useState(true);

  useEffect(() => {
    const params = {
      ...paramsFromUiState(indexUiState),
      ...(location.latLng ? { aroundLatLng: location.latLng } : {}),
    };
    let cancelled = false;
    Promise.all([
      basicSearchClient.search([{ indexName: INDEXES.before, params }]),
      searchClient.search([{ indexName: INDEXES.after, params }]),
    ])
      .then(([b, a]) => {
        if (cancelled) return;
        const before = b.results[0];
        const after = a.results[0];
        setStats({
          before: { hits: before.nbHits, cuisines: Object.keys(before.facets?.cuisine_group || {}).length },
          after: { hits: after.nbHits, cuisines: Object.keys(after.facets?.cuisine_group || {}).length },
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [indexUiState, location.latLng]);

  if (!stats) return null;

  const hasFilters = Object.keys(indexUiState.refinementList || {}).length > 0 || indexUiState.numericMenu?.stars_count;
  const query = indexUiState.query || '';
  const ratingFilterOn = Boolean(indexUiState.numericMenu?.stars_count);
  // "Better" is fewer, more precise results when searching or filtering; same count otherwise
  const hitsBetter = stats.before.hits !== stats.after.hits && (query || hasFilters) ? 'after' : null;
  const cuisinesBetter = stats.before.cuisines !== stats.after.cuisines ? 'after' : null;

  const columns = [
    { key: 'before', label: 'Before', sub: 'Basic database search, raw data', data: stats.before, note: scenario?.before },
    { key: 'after', label: 'After', sub: 'Algolia, cleaned data, tuned relevance', data: stats.after, note: scenario?.after },
  ];

  return (
    <div className="compare-wrap">
      <div className="compare-top">
        <span className="compare-caption">Click a card to switch the demo</span>
        {scenario && (
          <span className="verdict-row">
            <label className="notes-toggle">
              <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />
              Notes
            </label>
            <button type="button" className="info-close" onClick={onClose} aria-label="Close">×</button>
          </span>
        )}
      </div>
      <div className="compare">
        {columns.map((col) => (
          <button
            type="button"
            key={col.key}
            className={`compare-col ${mode === col.key ? 'current' : ''}`}
            onClick={() => onModeChange(col.key)}
            aria-pressed={mode === col.key}
          >
            <div className="compare-row">
              <div className="compare-head">
                <span className="compare-label">{col.label}</span>
                <span className="compare-sub">{col.sub}</span>
              </div>
              <div className="compare-metrics">
                <div className={`metric ${hitsBetter === col.key ? 'better' : ''} ${hitsBetter && hitsBetter !== col.key ? 'worse' : ''}`}>
                  <strong>{col.data.hits.toLocaleString()}</strong>
                  <span>{col.key === 'after' && location.latLng ? 'closest first' : 'results'}</span>
                </div>
                {ratingFilterOn ? (
                  // Ratings are text in the raw data, so a numeric filter can't match them on the basic side
                  <div className={`metric ${col.key === 'after' ? 'better' : 'worse'}`}>
                    <strong>{col.key === 'after' ? 'Yes' : 'No'}</strong>
                    <span>filter works</span>
                  </div>
                ) : (
                  <div className={`metric ${cuisinesBetter === col.key ? 'better' : ''} ${cuisinesBetter && cuisinesBetter !== col.key ? 'worse' : ''}`}>
                    <strong>{col.data.cuisines}</strong>
                    <span>cuisine filters</span>
                  </div>
                )}
              </div>
            </div>
            {showNotes && col.note && <p className="compare-note">{col.note}</p>}
            {col.key === 'after' && scenario?.features && (
              <span className="features">
                <span className="features-label">Algolia at work</span>
                {scenario.features.map((f) => <span key={f} className="feature">{f}</span>)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
