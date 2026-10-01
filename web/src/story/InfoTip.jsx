import { useState } from 'react';

// Small "i" button that opens a short explanation
export function InfoTip({ children, label = 'More info' }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="infotip">
      <button type="button" className="info-icon" aria-label={label} aria-expanded={open} onClick={() => setOpen(!open)}>
        i
      </button>
      {open && (
        <span className="info-pop" role="note">
          {children}
          <button type="button" className="info-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </span>
      )}
    </span>
  );
}
