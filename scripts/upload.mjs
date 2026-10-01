import fs from 'node:fs';
import { algoliasearch } from 'algoliasearch';

// Keys come from the .env file, never from the code
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_WRITE_KEY);
const indexName = 'restaurants';

const records = JSON.parse(fs.readFileSync('data/restaurants.json', 'utf8'));
const settings = JSON.parse(fs.readFileSync('config/index-settings.json', 'utf8'));
const synonyms = JSON.parse(fs.readFileSync('config/synonyms.json', 'utf8'));

// Create or update each record by objectID, so running it again never duplicates
await client.saveObjects({ indexName, objects: records, waitForTasks: true });
console.log(`Uploaded ${records.length} records to "${indexName}"`);

// Apply my relevance decisions from the config file
await client.setSettings({ indexName, indexSettings: settings });
console.log('Settings applied');

// Synonyms: alternate spellings diners use that aren't typos (bbq = barbecue)
await client.saveSynonyms({ indexName, synonymHit: synonyms, replaceExistingSynonyms: true });
console.log(`Synonyms applied: ${synonyms.length}`);