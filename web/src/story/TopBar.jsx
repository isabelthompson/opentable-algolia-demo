import { useState } from 'react';

const DASHBOARD_URL = `https://dashboard.algolia.com/apps/${import.meta.env.VITE_ALGOLIA_APP_ID}/explorer/browse/restaurants`;

// Logos: official files go in web/public (algolia-logo.svg, opentable-logo.svg).
// If a file is missing, the brand name is shown as text instead.
function Logo({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={className}>{fallback}</span>;
  return <img src={src} alt={alt} className={`logo ${className}`} onError={() => setFailed(true)} />;
}

export function TopBar({ page, onPageChange }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="wordmark">
          <Logo src="/opentable-logo.png" alt="OpenTable" className="wordmark-client" fallback="OpenTable" />
          <span className="wordmark-with">powered by</span>
          <Logo src="/algolia-logo.png" alt="Algolia" className="wordmark-algolia" fallback="algolia" />
        </div>
        <nav className="steps" aria-label="Sections">
          <button type="button" className={page === 'heard' ? 'step active' : 'step'} onClick={() => onPageChange('heard')}>
            <span className="step-number">1</span> What we heard
          </button>
          <button type="button" className={page === 'questions' ? 'step active' : 'step'} onClick={() => onPageChange('questions')}>
            <span className="step-number">2</span> Questions
          </button>
          <button type="button" className={page === 'demo' ? 'step active' : 'step'} onClick={() => onPageChange('demo')}>
            <span className="step-number">3</span> Live demo
          </button>
        </nav>
        <a className="dash-link" href={DASHBOARD_URL} target="_blank" rel="noreferrer">
          Dashboard ↗
        </a>
      </div>
    </header>
  );
}
