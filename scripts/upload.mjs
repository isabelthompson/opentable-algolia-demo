import fs from 'node:fs';
import { algoliasearch } from 'algoliasearch';

// Keys come from the .env file, never from the code
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_WRITE_KEY);
const indexName = 'restaurants';

const records = JSON.parse(fs.readFileSync('data/restaurants.json', 'utf8'));
const settings = JSON.parse(fs.readFileSync('config/index-settings.json', 'utf8'));

// Create or update each record by objectID, so running it again never duplicates
await client.saveObjects({ indexName, objects: records, waitForTasks: true });
console.log(`Uploaded ${records.length} records to "${indexName}"`);

// Apply my relevance decisions from the config file
await client.setSettings({ indexName, indexSettings: settings });
console.log('Settings applied');

// "Before" index: the client's raw data with Algolia's default relevance.
// Shows what they'd get by plugging Algolia in as-is, versus my cleaned data + tuning.
const beforeIndex = 'restaurants_before';
const beforeRecords = JSON.parse(fs.readFileSync('data/restaurants_before.json', 'utf8'));
await client.saveObjects({ indexName: beforeIndex, objects: beforeRecords, waitForTasks: true });
// Only the filters are configured, so the page works the same on both indexes
await client.setSettings({
  indexName: beforeIndex,
  indexSettings: { attributesForFaceting: settings.attributesForFaceting },
});
console.log(`Uploaded ${beforeRecords.length} raw records to "${beforeIndex}" (default relevance)`);

// Synonyms: alternate spellings diners use that aren't typos (bbq = barbecue)
const synonyms = JSON.parse(fs.readFileSync('config/synonyms.json', 'utf8'));
await client.saveSynonyms({ indexName, synonymHit: synonyms, replaceExistingSynonyms: true });
console.log(`Synonyms applied: ${synonyms.length}`);