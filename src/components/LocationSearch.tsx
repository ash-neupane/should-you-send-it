import React, { useState } from 'react';

interface Location {
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  onLocationChange: (location: Location) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange }) => {
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLocationChange({ lat: parseFloat(lat), lon: parseFloat(lon) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        placeholder="Latitude"
        step="any"
        required
      />
      <input
        type="number"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
        placeholder="Longitude"
        step="any"
        required
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default LocationSearch;