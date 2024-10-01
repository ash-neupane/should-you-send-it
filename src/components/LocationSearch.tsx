import React, { useState, useEffect } from 'react';
import { Location, LocationSearchProps } from '../types/types';
import { fetchLocationCoordinates } from '../api/LocationApi';
import '../styles/LocationSearch.css';

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationChange, defaultLocation }) => {
  const [searchType, setSearchType] = useState<'name' | 'coordinates'>('name');
  const [locationName, setLocationName] = useState<string>('');
  const [lat, setLat] = useState<string>(defaultLocation?.lat.toString() || '');
  const [lon, setLon] = useState<string>(defaultLocation?.lon.toString() || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultLocation) {
      setLat(defaultLocation.lat.toString());
      setLon(defaultLocation.lon.toString());
    }
  }, [defaultLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let location: Location;

      if (searchType === 'coordinates') {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error('Invalid coordinates');
        }
        location = { lat: latitude, lon: longitude, displayName: `${latitude}, ${longitude}` };
      } else {
        location = await fetchLocationCoordinates(locationName);
      }

      onLocationChange(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for the location.');
    } finally {
      setIsLoading(false);
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
            placeholder="Enter mountain peak name"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default LocationSearch;