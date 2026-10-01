import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Search-only key: safe in the browser, it can only read
export const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY,
);

// "After" = my tuned Algolia index. "Before" is not Algolia at all (see basicSearchClient.js);
// the name here is only the key InstantSearch uses to keep the two states apart.
export const INDEXES = {
  after: 'restaurants',
  before: 'restaurants_before',
};
