import { useEffect, useState } from 'react';

// Keeps call notes in this browser, so they survive a page refresh during the call
export function useLocalNotes(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage can be blocked; notes still work for this session
    }
  }, [key, value]);
  return [value, setValue];
}
