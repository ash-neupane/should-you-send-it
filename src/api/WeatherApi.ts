import { RawWeatherData } from "../types/types"

  export const fetchWeatherData = async (lat: number, lon: number): Promise<RawWeatherData> => {
    console.group("Forecast Retrieval");
    const response = await fetch(`http://localhost:8000/temperature/${lat}/${lon}`);
    if (!response.ok) {
      console.log("Failed to get weather data: ", response.status, response.statusText)
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    console.log("Search query:", lat, lon);
    console.log("Result:", data);
    console.groupEnd();
    return data;
  };
  