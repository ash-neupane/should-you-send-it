interface WeatherData {
    summary1_3: string;
    summary4_6: string;
    days: Array<{
      date: string;
      am: { condition: string; wind: { speed: number; direction: number }; temp: number };
      pm: { condition: string; wind: { speed: number; direction: number }; temp: number };
      night: { condition: string; wind: { speed: number; direction: number }; temp: number };
    }>;
  }
  
  export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
    const response = await fetch(`http://localhost:8000/temperature/${lat}/${lon}`);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return await response.json();
  };
  