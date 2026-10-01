// "Before" side of the demo: a basic database-style search, no Algolia involved.
// It mimics what a SQL `WHERE name LIKE '%query%'` gives you: exact substring
// match, no typo tolerance, no synonyms, no ranking (file order), exact filters.
// It answers in Algolia's response shape so the same InstantSearch UI can render it.
// Generated with AI assistance to simulate the client's current search.

let records = null;
async function load() {
  if (!records) {
    const mod = await import('../../../data/restaurants_before.json');
    records = mod.default;
  }
  return records;
}

// A basic search looks at every text column, so "discover" also matches the payment options
const HIGHLIGHTED_FIELDS = ['name', 'food_type'];

function matchesQuery(record, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return Object.values(record).some((v) => (typeof v === 'string' || Array.isArray(v)) && String(v).toLowerCase().includes(q));
}

// facetFilters: [["cuisine_group:Italian", "cuisine_group:Pizza"], "price_range:$$"] (inner arrays = OR, outer = AND)
function matchesFacets(record, facetFilters = []) {
  return facetFilters.every((group) => {
    const options = Array.isArray(group) ? group : [group];
    return options.some((opt) => {
      const [attr, ...rest] = opt.split(':');
      const value = rest.join(':');
      return [].concat(record[attr] ?? []).map(String).includes(value);
    });
  });
}

// numericFilters: ["stars_count>=4.5"]. Raw ratings are text, so a numeric
// comparison never matches, exactly what happens in a database with a text column.
function matchesNumeric(record, numericFilters = []) {
  return numericFilters.every((filter) => {
    const [, attr, op, num] = filter.match(/^(\w+)(>=|<=|>|<|=)(.+)$/) || [];
    const value = record[attr];
    if (typeof value !== 'number') return false;
    const n = Number(num);
    return op === '>=' ? value >= n : op === '<=' ? value <= n : op === '>' ? value > n : op === '<' ? value < n : value === n;
  });
}

function highlight(text, query, pre, post) {
  const value = String(text ?? '');
  if (!query) return { value, matchLevel: 'none', matchedWords: [] };
  const i = value.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return { value, matchLevel: 'none', matchedWords: [] };
  return {
    value: value.slice(0, i) + pre + value.slice(i, i + query.length) + post + value.slice(i + query.length),
    matchLevel: 'full',
    matchedWords: [query],
  };
}

function countFacets(hits, facets) {
  const out = {};
  for (const attr of facets) {
    out[attr] = {};
    for (const hit of hits) {
      for (const v of [].concat(hit[attr] ?? [])) out[attr][v] = (out[attr][v] || 0) + 1;
    }
  }
  return out;
}

function runOne(all, { query = '', facetFilters, numericFilters, page = 0, hitsPerPage = 20, facets = [], highlightPreTag = '<mark>', highlightPostTag = '</mark>' }) {
  const started = performance.now();
  const matched = all.filter((r) => matchesQuery(r, query) && matchesFacets(r, facetFilters) && matchesNumeric(r, numericFilters));
  const facetList = [].concat(facets).filter(Boolean);
  const hits = matched.slice(page * hitsPerPage, (page + 1) * hitsPerPage).map((r) => ({
    ...r,
    _highlightResult: Object.fromEntries(HIGHLIGHTED_FIELDS.map((f) => [f, highlight(r[f], query, highlightPreTag, highlightPostTag)])),
  }));
  return {
    hits,
    nbHits: matched.length,
    page,
    nbPages: Math.ceil(matched.length / hitsPerPage),
    hitsPerPage,
    facets: countFacets(matched, facetList.includes('*') ? ['cuisine_group', 'price_range', 'dining_style'] : facetList),
    exhaustiveNbHits: true,
    exhaustiveFacetsCount: true,
    processingTimeMS: Math.max(1, Math.round(performance.now() - started)),
    query,
    params: '',
  };
}

export const basicSearchClient = {
  async search(requests) {
    const all = await load();
    return { results: requests.map((r) => runOne(all, r.params || {})) };
  },
  // Used by the searchable cuisine box: plain substring match on facet values
  async searchForFacetValues(requests) {
    const all = await load();
    return requests.map(({ params }) => {
      const { facetName, facetQuery = '', maxFacetHits = 10 } = params;
      const counts = countFacets(all, [facetName])[facetName];
      const facetHits = Object.entries(counts)
        .filter(([v]) => v.toLowerCase().includes(facetQuery.toLowerCase()))
        .slice(0, maxFacetHits)
        .map(([value, count]) => ({ value, count, highlighted: value }));
      return { facetHits, exhaustiveFacetsCount: true, processingTimeMS: 1 };
    });
  },
};
