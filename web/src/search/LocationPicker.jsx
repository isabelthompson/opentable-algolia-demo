import { LOCATIONS } from './locations';

export function LocationPicker({ location, onChange }) {
  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({ id: 'me', label: 'My location', latLng: `${latitude},${longitude}` });
      },
      // If the user says no, keep the current city instead of breaking the search
      () => {},
    );
  }

  return (
    <div className="location-picker">
      <span className="label">Near</span>
      <select
        value={location.id}
        onChange={(e) => onChange(LOCATIONS.find((l) => l.id === e.target.value))}
      >
        {location.id === 'me' && <option value="me">My location</option>}
        {LOCATIONS.map((l) => (
          <option key={l.id} value={l.id}>{l.label}</option>
        ))}
      </select>
      <button type="button" className="link-button" onClick={useMyLocation}>
        Use my location
      </button>
    </div>
  );
}
