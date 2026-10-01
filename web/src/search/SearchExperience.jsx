import {
  Configure,
  Hits,
  Pagination,
  RefinementList,
  SearchBox,
  Stats,
  ClearRefinements,
  CurrentRefinements,
  useInstantSearch,
} from 'react-instantsearch';
import { ResultCard } from './ResultCard';
import { LocationPicker } from './LocationPicker';
import { RatingFilter } from './RatingFilter';

// Explains an empty result instead of leaving a blank page
function NoResults({ mode }) {
  const { results, indexUiState } = useInstantSearch();
  if (!results || results.nbHits > 0 || results.__isArtificial) return null;
  const ratingOn = Boolean(indexUiState.numericMenu?.stars_count);
  const query = indexUiState.query;
  let why = 'Nothing matches this search.';
  if (mode === 'before' && ratingOn) why = 'In the raw file the rating is text ("4.6"), so a basic search can\'t compare it with a number. The filter silently returns nothing.';
  else if (mode === 'before' && query) why = `A basic search only finds the exact text "${query}". No typo tolerance, no word splitting, no synonyms.`;
  return (
    <div className="no-results">
      <strong>No results</strong>
      <p>{why}</p>
    </div>
  );
}

export function SearchExperience({ location, onLocationChange, mode }) {
  return (
    <div className="search-experience">
      {/* Ranking info powers "Why this result?"; location powers geo ranking */}
      <Configure
        hitsPerPage={12}
        getRankingInfo
        aroundLatLng={location.latLng || undefined}
        // Within 8 km, distance ties and the best rated wins. The card shows the exact distance itself.
        aroundPrecision={location.latLng ? 8000 : undefined}
      />

      <div className="search-bar">
        <SearchBox placeholder="Search restaurants, cuisines, neighborhoods" autoFocus={false} />
        <div className="search-controls">
          <LocationPicker location={location} onChange={onLocationChange} />
        </div>
      </div>

      <div className="search-layout">
        <aside className="filters">
          <ClearRefinements translations={{ resetButtonText: 'Clear filters' }} />
          <h4>Cuisine</h4>
          <RefinementList attribute="cuisine_group" searchable limit={8} showMore searchablePlaceholder="Find a cuisine" />
          <h4>Rating</h4>
          <RatingFilter />
          <h4>Price</h4>
          <RefinementList attribute="price_range" />
          <h4>Dining style</h4>
          <RefinementList attribute="dining_style" />
        </aside>

        <section className="results">
          <div className="results-head">
            <Stats />
            {/* Shows the active filters as pills, so a filter-only scenario is visible at a glance */}
            <CurrentRefinements
              transformItems={(items) => items.map((item) => ({ ...item, label: item.attribute === 'stars_count' ? 'Rating' : item.label.replace('_', ' ') }))}
            />
          </div>
          <NoResults mode={mode} />
          <Hits
            hitComponent={(props) => <ResultCard {...props} origin={location.latLng} />}
            classNames={{ list: 'hits-grid' }}
          />
          <Pagination />
        </section>
      </div>
    </div>
  );
}
