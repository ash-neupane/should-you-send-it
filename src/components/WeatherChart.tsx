import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { DayData, WeatherData } from '../types/types';
import '../styles/WeatherChart.css';

interface WeatherChartProps {
  data: WeatherData;
}

const PERIODS = ['am', 'pm', 'night'] as const;
type Period = typeof PERIODS[number];

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const WEATHER_ICONS: Record<string, string> = {
  cloudy: '☁️',
  rainy: '🌧️',
  sunny: '☀️',
  'partly cloudy': '⛅',
  stormy: '⛈️',
  snowy: '❄️',
  clear: '☀️',
};

const fahrenheitToCelsius = (f: number): number => (f - 32) * 5 / 9;

const getWeatherIcon = (condition: string): string =>
  WEATHER_ICONS[condition.toLowerCase()] || '🌤️';

const getWindDirection = (degree: number): string =>
  WIND_DIRECTIONS[Math.round(degree / 45) % 8];

const getTemperatureColor = (celsiusTemp: number): string => {
  const normalized = Math.max(0, Math.min(1, celsiusTemp / 40));
  const r = Math.round(255 * normalized);
  const b = Math.round(255 * (1 - normalized));
  return `rgb(${r}, 0, ${b})`;
};

interface Sample {
  time: string;
  tempF: number;
  condition: string;
  windSpeed: number;
  windDirection: number;
}

const flattenDays = (days: DayData[]): Sample[] =>
  days.flatMap(day =>
    PERIODS.flatMap<Sample>(period => {
      const periodData = day[period as Period];
      if (!periodData) return [];
      return [{
        time: `${day.date} ${period.toUpperCase()}`,
        tempF: periodData.temp,
        condition: periodData.condition,
        windSpeed: periodData.wind.speed,
        windDirection: periodData.wind.direction,
      }];
    })
  );

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const [isCelsius, setIsCelsius] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartDimensions({
          width: chartRef.current.offsetWidth,
          height: window.innerHeight * 0.3,
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const limitedData = data.days.slice(0, 3);
  const samples = flattenDays(limitedData);
  const convertTemp = (tempF: number): number => isCelsius ? fahrenheitToCelsius(tempF) : tempF;
  const formatTemp = (tempF: number): string =>
    `${Math.round(convertTemp(tempF))}°${isCelsius ? 'C' : 'F'}`;

  const times = samples.map(s => s.time);
  const displayTemps = samples.map(s => convertTemp(s.tempF));
  const markerColors = samples.map(s => getTemperatureColor(fahrenheitToCelsius(s.tempF)));
  const hoverText = samples.map(s =>
    `${s.time}<br>Temp: ${formatTemp(s.tempF)}<br>` +
    `${s.condition} ${getWeatherIcon(s.condition)}<br>` +
    `Wind: ${s.windSpeed} km/h ${getWindDirection(s.windDirection)}`
  );
  const annotations = samples.map((s, i) => ({
    x: s.time,
    y: displayTemps[i],
    text: getWeatherIcon(s.condition),
    showarrow: false,
    yshift: 8,
    font: { size: 10 },
  }));

  return (
    <div className="weather-chart" ref={chartRef}>
      <div className="plot-container">
        <Plot
          data={[
            {
              x: times,
              y: displayTemps,
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: 'rgba(100, 149, 237, 0.5)', width: 1, dash: 'dot' },
              marker: {
                color: markerColors,
                size: 4,
                symbol: 'circle',
                line: { color: 'white', width: 1 },
              },
              name: 'Temperature',
              hoverinfo: 'text',
              hovertext: hoverText,
            },
          ]}
          layout={{
            title: { text: 'Weather Forecast', font: { size: 14 } },
            xaxis: { title: 'Time', tickangle: -45, tickfont: { size: 8 } },
            yaxis: {
              title: `Temp (${isCelsius ? '°C' : '°F'})`,
              gridcolor: 'rgba(0,0,0,0.1)',
              tickfont: { size: 8 },
            },
            width: chartDimensions.width,
            height: chartDimensions.height,
            autosize: true,
            margin: { l: 30, r: 10, b: 30, t: 30 },
            paper_bgcolor: 'rgb(240, 240, 240)',
            plot_bgcolor: 'rgb(250, 250, 250)',
            showlegend: false,
            hovermode: 'closest',
            annotations,
          }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
      <div className="summaries">
        {limitedData.map(day => (
          <div key={day.date} className="daily-summary">
            <h4 className="summary-header">{day.date}</h4>
            <p>{day.summary}</p>
          </div>
        ))}
      </div>
      <div className="legend">
        <p>🌡️ Temp: Blue (Cold) to Red (Hot) | ☁️ Cloudy | 🌧️ Rainy | ☀️ Sunny | ⛅ Partly Cloudy | ⛈️ Stormy | ❄️ Snowy | 💨 Wind: N, NE, E, SE, S, SW, W, NW</p>
      </div>
      <button className="toggle-button" onClick={() => setIsCelsius(prev => !prev)}>
        {isCelsius ? '°F' : '°C'}
      </button>
    </div>
  );
};

export default WeatherChart;
