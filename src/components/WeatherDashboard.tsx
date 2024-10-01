import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart';
import LocationSearch from './LocationSearch';
import { fetchWeatherData } from '../api/WeatherApi';
import '../styles/WeatherDashboard.css'; // Import the CSS file
import {Location, WeatherPeriod, DayData, RawDayData, WeatherData} from "../types/types"

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location>({
      lat: 40.7128, 
      lon: -74.0060,
      displayName: 'New York City' 
  }); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawData = await fetchWeatherData(location.lat, location.lon);
        const transformedData: WeatherData = {
          days: rawData.days.slice(0, 3).map((day: RawDayData) => ({
            ...day,
            summary: generateDailySummary(day)
          }))
        };
        setWeatherData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    loadWeatherData();
  }, [location]);

  const generateDailySummary = (day: RawDayData): string => {
    const conditions = [day.am, day.pm, day.night]
      .filter((period): period is WeatherPeriod => period !== null)
      .map(period => period.condition);
    const uniqueConditions = Array.from(new Set(conditions));
    const maxWindSpeed = Math.max(
      ...[day.am, day.pm, day.night]
        .filter((period): period is WeatherPeriod => period !== null)
        .map(period => period.wind.speed)
    );
    return `Expect ${uniqueConditions.join(", ")} conditions. ` +
      `Wind speeds up to ${maxWindSpeed} km/h.`;
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  return (
    <div className="weather-dashboard">
      <h1 className="title">Which Mountain are you thinking about?</h1>
      <LocationSearch
        onLocationChange={handleLocationChange}
        defaultLocation={location}
      />
      {isLoading && <p>Loading weather data...</p>}
      {error && <p className="error">Error: {error}</p>}
      {weatherData && <WeatherChart data={weatherData} />}
    </div>
  );
};

export default WeatherDashboard;
