import { useState } from 'react';
import { Highlight } from 'react-instantsearch';
import { WhyThisResult } from './WhyThisResult';
import { milesBetween, parseLatLng } from './distance';

export function ResultCard({ hit, origin }) {
  const [showWhy, setShowWhy] = useState(false);
  const from = parseLatLng(origin);
  const miles = from && hit._geoloc ? `${milesBetween(from, hit._geoloc).toFixed(1)} mi` : null;

  const cuisines = [].concat(hit.cuisine);

  return (
    <article className="card">
      <div className="card-top">
        <span className="initial" aria-hidden="true">{hit.name.charAt(0)}</span>
        <div>
          <h3><Highlight attribute="name" hit={hit} /></h3>
          <p className="meta">{cuisines.join(' · ')} · {hit.price_range}</p>
        </div>
      </div>
      {/* Neighborhood + address help users pick the right location of a chain */}
      <p className="place">
        {hit.neighborhood}, {hit.city} {miles && <span className="distance">{miles}</span>}
      </p>
      <p className="address">{hit.address}</p>
      <div className="card-actions">
        <span className="rating">
          <span className="stars">{Number(hit.stars_count).toFixed(1)}</span> {hit.reviews_count} reviews
        </span>
        <span>
          {hit._rankingInfo && <button type="button" className="link-button" onClick={() => setShowWhy(!showWhy)}>
            {showWhy ? 'Hide' : 'Why?'}
          </button>}
          <a className="reserve" href={hit.reserve_url} target="_blank" rel="noreferrer">Reserve</a>
        </span>
      </div>
      {showWhy && <WhyThisResult hit={hit} />}
    </article>
  );
}
