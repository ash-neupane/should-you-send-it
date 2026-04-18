import { RawWeatherData } from '../types/types';

export const fetchWeatherData = async (lat: number, lon: number): Promise<RawWeatherData> => {
  const response = await fetch(`http://localhost:8000/temperature/${lat}/${lon}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data (${response.status})`);
  }
  return response.json();
};
