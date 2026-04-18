import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart';
import LocationSearch from './LocationSearch';
import { fetchWeatherData } from '../api/WeatherApi';
import { Location, WeatherPeriod, RawDayData, WeatherData } from '../types/types';
import '../styles/WeatherDashboard.css';

const DEFAULT_LOCATION: Location = {
  lat: 44.2705,
  lon: -71.3033,
  displayName: 'Mount Washington, NH',
};

const generateDailySummary = (day: RawDayData): string => {
  const periods = [day.am, day.pm, day.night]
    .filter((period): period is WeatherPeriod => period !== null);

  if (periods.length === 0) {
    return 'No forecast available.';
  }

  const uniqueConditions = Array.from(new Set(periods.map(p => p.condition)));
  const maxWindSpeed = Math.max(...periods.map(p => p.wind.speed));
  return `Expect ${uniqueConditions.join(', ')} conditions. Wind speeds up to ${maxWindSpeed} km/h.`;
};

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawData = await fetchWeatherData(location.lat, location.lon);
        if (cancelled) return;
        setWeatherData({
          days: rawData.days.slice(0, 3).map(day => ({
            ...day,
            summary: generateDailySummary(day),
          })),
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadWeatherData();
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className="weather-dashboard">
      <h1 className="title">Which Mountain are you thinking about?</h1>
      <LocationSearch onLocationChange={setLocation} defaultLocation={location} />
      {isLoading && <p>Loading weather data...</p>}
      {error && <p className="error">Error: {error}</p>}
      {weatherData && <WeatherChart data={weatherData} />}
    </div>
  );
};

export default WeatherDashboard;
