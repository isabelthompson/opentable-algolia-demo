import fs from 'node:fs';
import { algoliasearch } from 'algoliasearch';

// Keys come from the .env file, never from the code
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_WRITE_KEY);
const indexName = 'restaurants';

const records = JSON.parse(fs.readFileSync('data/restaurants.json', 'utf8'));
const settings = JSON.parse(fs.readFileSync('config/index-settings.json', 'utf8'));

// Replace everything in the index, so running it again never creates duplicates
await client.saveObjects({ indexName, objects: records, waitForTasks: true });
console.log(`Uploaded ${records.length} records to "${indexName}"`);

// Apply my relevance decisions from the config file
await client.setSettings({ indexName, indexSettings: settings });
console.log('Settings applied');