import React, { useState, useEffect } from 'react';
import '../styles/LocationSearch.css';

interface Location {
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  onLocationChange: (location: Location) => void;
  defaultLocation?: Location;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange, defaultLocation }) => {
  const [searchType, setSearchType] = useState<'name' | 'coordinates'>('name');
  const [locationName, setLocationName] = useState<string>('');
  const [lat, setLat] = useState<string>(defaultLocation?.lat.toString() || '');
  const [lon, setLon] = useState<string>(defaultLocation?.lon.toString() || '');

  useEffect(() => {
    if (defaultLocation) {
      setLat(defaultLocation.lat.toString());
      setLon(defaultLocation.lon.toString());
    }
  }, [defaultLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchType === 'coordinates') {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        onLocationChange({ lat: latitude, lon: longitude });
      }
    } else {
      // TODO: Implement API call to get coordinates from location name
      console.log(`Searching for: ${locationName}`);
    }
  };

  const handleSearchTypeToggle = () => {
    setSearchType(prevType => prevType === 'name' ? 'coordinates' : 'name');
  };

  return (
    <form className={`search-container ${searchType}`} onSubmit={handleSubmit}>
      {searchType === 'name' && (
        <div className="search-inputs">
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Enter location name"
            required
          />
          <button type="submit">Search</button>
        </div>
      )}

      <div className="search-toggle">
        <span className={searchType === 'name' ? 'active' : ''}>Name</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={searchType === 'coordinates'}
            onChange={handleSearchTypeToggle}
          />
          <span className="slider round"></span>
        </label>
        <span className={searchType === 'coordinates' ? 'active' : ''}>GPS</span>
      </div>
      
      {searchType === 'coordinates' && (
        <div className="search-inputs">
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
        </div>
      )}
    </form>
  );
};

export default LocationSearch;