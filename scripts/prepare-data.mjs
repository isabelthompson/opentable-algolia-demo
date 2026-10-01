import fs from 'node:fs';

// 1. Read the restaurant list (JSON)
const restaurants = JSON.parse(fs.readFileSync('dataset/restaurants_list.json', 'utf8'));

// 2. Read the extra info (CSV, separated by ";")
const csvText = fs.readFileSync('dataset/restaurants_info.csv', 'utf8');
const lines = csvText.trim().split('\n');
const headers = lines[0].split(';');

// 3. Turn each CSV line into an object, indexed by objectID
const infoById = {};
for (const line of lines.slice(1)) {
  const values = line.split(';');
  const row = {};
  headers.forEach((header, i) => {
    row[header] = values[i];
  });
  infoById[row.objectID] = row;
}

// Cuisine cleanup: decisions from my data audit
// Same cuisine written in different ways -> one name
const RENAME = {
  'Steak': 'Steakhouse',
  'Hawaii Regional Cuisine': 'Hawaiian',
  'Global, International': 'International',
  'Fusion / Eclectic': 'Fusion',
};

// Several cuisines in one value -> split into a list
const SPLIT = {
  'Creole / Cajun / Southern': ['Creole', 'Cajun', 'Southern'],
  'Mexican / Southwestern': ['Mexican', 'Southwestern'],
  'Latin / Spanish': ['Latin American', 'Spanish'],
  'Contemporary French / American': ['Contemporary French', 'Contemporary American'],
};

// Specific cuisine -> broader group, used for the cuisine filter.
// Creole, Cajun and Southern stay as their own filters on purpose (see question 2 in the demo).
const GROUP = {
  'Contemporary American': 'American', 'Californian': 'American',
  'Contemporary Southern': 'Southern', 'Comfort Food': 'American', 'Northwest': 'American',
  'Southwest': 'American', 'Burgers': 'American', 'Barbecue': 'American', 'Low Country': 'American',
  'Contemporary Italian': 'Italian', 'Sicilian': 'Italian', 'Pizzeria': 'Italian',
  'Contemporary French': 'French', 'French American': 'French', 'Provencal': 'French',
  'Contemporary Mexican': 'Mexican', 'Regional Mexican': 'Mexican', 'Traditional Mexican': 'Mexican',
  'Tex-Mex': 'Mexican', 'Southwestern': 'Mexican',
  'Sushi': 'Japanese', 'Hibachi': 'Japanese',
  'Contemporary Asian': 'Asian', 'Pan-Asian': 'Asian', 'Chinese': 'Asian', 'Dim Sum': 'Asian',
  'Thai': 'Asian', 'Korean': 'Asian', 'Vietnamese': 'Asian', 'Southeast Asian': 'Asian',
  'Filipino': 'Asian', 'Burmese': 'Asian',
  'Contemporary Indian': 'Indian', 'South Indian': 'Indian',
  'Brazilian Steakhouse': 'Steakhouse', 'Prime Rib': 'Steakhouse',
  'Contemporary European': 'European', 'Modern European': 'European', 'Continental': 'European',
  'Eastern European': 'European',
  'Cuban': 'Latin American', 'Peruvian': 'Latin American', 'Argentinean': 'Latin American',
  'Brazilian': 'Latin American', 'Puerto Rican': 'Latin American', 'South American': 'Latin American',
  'Caribbean': 'Latin American',
  'Greek': 'Mediterranean', 'Lebanese': 'Mediterranean', 'Turkish': 'Mediterranean',
  'Moroccan': 'Mediterranean', 'Middle Eastern': 'Mediterranean', 'Persian': 'Mediterranean',
  'Syrian': 'Mediterranean',
  'Tapas / Small Plates': 'Spanish', 'Basque': 'Spanish',
  'Gastro Pub': 'Bar & Pub', 'Wine Bar': 'Bar & Pub', 'Brewery': 'Bar & Pub', 'Beer Garden': 'Bar & Pub',
  'Bar / Lounge / Bottle Service': 'Bar & Pub',
};

function cleanCuisine(foodType) {
  const renamed = RENAME[foodType] || foodType;
  return SPLIT[renamed] || [renamed];
}

// 4. Join both files into one record per restaurant
const records = restaurants.map((restaurant) => {
  const info = infoById[String(restaurant.objectID)];
  const cuisine = cleanCuisine(info.food_type);
  const cuisineGroup = [...new Set(cuisine.map((name) => GROUP[name] || name))];

  return {
    objectID: String(restaurant.objectID),
    name: restaurant.name,
    address: restaurant.address,
    neighborhood: info.neighborhood,
    city: restaurant.city,
    state: restaurant.state,
    area: restaurant.area,
    cuisine,
    cuisine_group: cuisineGroup,
    dining_style: info.dining_style,
    price_range: info.price_range,
    // CSV values are text, ranking needs real numbers
    stars_count: Number(info.stars_count),
    reviews_count: Number(info.reviews_count),
    // CSV phone is already formatted, the JSON one is messy
    phone: info.phone_number,
    payment_options: restaurant.payment_options,
    image_url: restaurant.image_url,
    reserve_url: restaurant.reserve_url,
    _geoloc: restaurant._geoloc,
  };
});

// 5. Save the clean records, ready to send to Algolia
fs.writeFileSync('data/restaurants.json', JSON.stringify(records, null, 2));
console.log('Records written:', records.length);

// 6. "Before" records: the client's data exactly as delivered, joined but NOT cleaned
// (ratings stay as text, cuisines stay messy, the JSON phone is kept).
// The web demo reads this file directly to simulate a basic database search.
const beforeRecords = restaurants.map((restaurant) => {
  const info = infoById[String(restaurant.objectID)];
  return {
    ...restaurant,
    ...info,
    objectID: String(restaurant.objectID),
    cuisine: [info.food_type],
    cuisine_group: [info.food_type],
  };
});
fs.writeFileSync('data/restaurants_before.json', JSON.stringify(beforeRecords, null, 2));
console.log('Before records written:', beforeRecords.length);