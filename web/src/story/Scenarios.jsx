import { useInstantSearch } from 'react-instantsearch';
import { LOCATIONS } from '../search/locations';

const GROUPS = [
  {
    persona: 'Knows the name',
    scenarios: [
      {
        label: 'Typo: "magianos"',
        features: ['Typo tolerance'],
        state: { query: 'magianos' },
        before: 'No results. A basic search needs the exact spelling.',
        after: 'Finds Maggiano\'s. Typo tolerance is built in, no setup needed.',
      },
      {
        label: 'Typed together: "capitalgrille"',
        features: ['Word splitting', 'Typo tolerance'],
        state: { query: 'capitalgrille' },
        before: 'No results. "capitalgrille" is not a substring of "Capital Grille".',
        after: 'Finds The Capital Grille. Algolia splits and joins words automatically.',
      },
      {
        label: 'Alternate spelling: "bbq"',
        features: ['Synonyms'],
        state: { query: 'bbq' },
        location: 'anywhere',
        before: 'Only records with "bbq" written in them. A basic search doesn\'t know bbq means barbecue.',
        after: 'A synonym links bbq, barbecue and bar-b-q, so the Barbecue cuisine shows up too.',
      },
      {
        label: 'Same chain, 2 locations',
        features: ['Searchable attributes', 'Geo ranking', 'Enriched records'],
        state: { query: 'ruths chris indianapolis' },
        location: 'anywhere',
        before: 'No results. A basic search looks for the whole phrase, and "Ruth\'s Chris" has an apostrophe.',
        after: 'Both locations, with neighborhood and address so the diner picks the right one. The closest comes first.',
      },
    ],
  },
  {
    persona: 'Exploring',
    scenarios: [
      {
        label: 'Top Italian near me',
        features: ['Facets', 'Numeric filters', 'Geo ranking', 'Custom ranking'],
        state: { refinementList: { cuisine_group: ['Italian'] }, numericMenu: { stars_count: '4.5:' } },
        location: 'nyc',
        before: 'No results. Ratings are stored as text, so "4.5 and up" can\'t filter them. "Italian" would also miss Sicilian, Pizzeria and Contemporary Italian.',
        after: 'The rating filter works and "Italian" includes every Italian style. Closest first, best rated as tie-breaker.',
      },
      {
        label: 'Empty search near me',
        features: ['Geo ranking', 'Custom ranking'],
        state: { query: '' },
        location: 'nyc',
        before: 'With no query, results come back in database order, no idea where the diner is.',
        after: 'No query needed: the closest, best-rated restaurants appear first. A useful starting point for browsing.',
      },
      {
        label: 'Date night',
        features: ['Facets', 'Numeric filters', 'Geo ranking', 'Custom ranking'],
        state: { refinementList: { dining_style: ['Fine Dining'] }, numericMenu: { stars_count: '4.5:' } },
        location: 'nyc',
        before: 'No results, for the same reason: rating is text.',
        after: 'Fine dining, 4.5+ stars, near the diner.',
      },
      {
        label: 'Great value',
        features: ['Facets', 'Numeric filters', 'Geo ranking', 'Custom ranking'],
        state: { refinementList: { price_range: ['$30 and under'] }, numericMenu: { stars_count: '4.5:' } },
        location: 'chicago',
        before: 'No results: the rating filter can\'t work on text.',
        after: 'Affordable places diners love, near the diner.',
      },
    ],
  },
  {
    persona: 'Relevance',
    scenarios: [
      {
        label: 'Noise: "discover"',
        features: ['Searchable attributes'],
        state: { query: 'discover' },
        location: 'anywhere',
        before: 'Thousands of results. A basic search looks at every column, so "discover" matches the Discover card in payment options.',
        after: 'Zero noise: only the fields diners search (name, cuisine, place) are searchable.',
      },
    ],
  },
];

// The active scenario lives in App, so it stays visible when switching Before/After
export function Scenarios({ onLocationChange, active, setActive }) {
  const { setIndexUiState } = useInstantSearch();

  function run(scenario) {
    if (scenario.location) onLocationChange(LOCATIONS.find((l) => l.id === scenario.location));
    setIndexUiState({ query: '', refinementList: {}, numericMenu: {}, page: 1, ...scenario.state });
    setActive(scenario);
  }

  return (
    <div className="scenarios">
      <div className="scenario-grid">
        {GROUPS.map((group) => (
          <div key={group.persona} className="scenario-col">
            <span className="scenario-persona">{group.persona}</span>
            <div className="scenario-chips">
              {group.scenarios.map((scenario) => (
                <button
                  key={scenario.label}
                  type="button"
                  className={active?.label === scenario.label ? 'chip active' : 'chip'}
                  onClick={() => run(scenario)}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
