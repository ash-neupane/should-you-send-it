import React, { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart';
import LocationSearch from './LocationSearch';

interface Location {
  lat: number;
  lon: number;
}

interface WeatherData {
  properties: {
    periods: Array<{
      startTime: string;
      temperature: number;
    }>;
  };
}

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location>({ lat: 46.8517, lon: -121.7562 }); // Default to Mt Rainier
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData(location.lat, location.lon);
  }, [location]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      const forecastUrl = data.properties.forecastHourly;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      const forecastData: WeatherData = await forecastResponse.json();
      setWeatherData(forecastData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  return (
    <div className="weather-dashboard">
      <h1>Weather Forecast</h1>
      <LocationSearch onLocationChange={handleLocationChange} />
      {isLoading && <p>Loading weather data...</p>}
      {error && <p className="error">Error: {error}</p>}
      {weatherData && <WeatherChart data={weatherData} />}
    </div>
  );
};

export default WeatherDashboard;