import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';
import '../styles/WeatherChart.css';

interface WeatherPeriod {
  condition: string;
  wind: { speed: number; direction: number };
  temp: number;
}

interface DayData {
  date: string;
  summary: string;
  am: WeatherPeriod | null;
  pm: WeatherPeriod | null;
  night: WeatherPeriod | null;
}

interface WeatherData {
  days: DayData[];
}

interface WeatherChartProps {
  data: WeatherData;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const [isCelsius, setIsCelsius] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const containerWidth = chartRef.current.offsetWidth;
        setChartDimensions({
          width: containerWidth,
          height: window.innerHeight * 0.3  // 30% of viewport height
        });
      }
    };
  
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
  
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const limitedData = data.days.slice(0, 3);
  const times: string[] = [];
  const temperatures: number[] = [];
  const dayLabels: string[] = [];
  const conditions: string[] = [];
  const windSpeeds: number[] = [];
  const windDirections: number[] = [];

  limitedData.forEach((day) => {
    ['am', 'pm', 'night'].forEach((period) => {
      const periodData = day[period as keyof Pick<DayData, 'am' | 'pm' | 'night'>];
      if (periodData) {
        times.push(`${day.date} ${period.toUpperCase()}`);
        temperatures.push(periodData.temp);
        dayLabels.push(`${day.date} ${period.toUpperCase()}`);
        conditions.push(periodData.condition);
        windSpeeds.push(periodData.wind.speed);
        windDirections.push(periodData.wind.direction);
      }
    });
  });

  const convertTemp = (temp: number): number => isCelsius ? (temp - 32) * 5/9 : temp;
  const formatTemp = (temp: number): string => `${Math.round(convertTemp(temp))}°${isCelsius ? 'C' : 'F'}`;

  const getWeatherIcon = (condition: string): string => {
    const iconMap: { [key: string]: string } = {
      'cloudy': '☁️',
      'rainy': '🌧️',
      'sunny': '☀️',
      'partly cloudy': '⛅',
      'stormy': '⛈️',
      'snowy': '❄️',
    };
    return iconMap[condition.toLowerCase()] || '🌤️';
  };

  const getWindDirection = (degree: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degree / 45) % 8];
  };

  const getTemperatureColor = (temp: number): string => {
    const celsiusTemp = isCelsius ? temp : (temp - 32) * 5/9;
    const minTemp = 0;
    const maxTemp = 40;
    const normalizedTemp = Math.max(0, Math.min(1, (celsiusTemp - minTemp) / (maxTemp - minTemp)));
    const r = Math.round(255 * normalizedTemp);
    const b = Math.round(255 * (1 - normalizedTemp));
    return `rgb(${r}, 0, ${b})`;
  };

  return (
    <div className="weather-chart" ref={chartRef}>
      <div className="plot-container">
        <Plot
          data={[
            {
              x: times,
              y: temperatures.map(convertTemp),
              type: 'scatter',
              mode: 'lines+markers',
              line: { 
                color: 'rgba(100, 149, 237, 0.5)',
                width: 1,
                dash: 'dot',
              },
              marker: { 
                color: temperatures.map(getTemperatureColor),
                size: 4,
                symbol: 'circle',
                line: {
                  color: 'white',
                  width: 1
                }
              },
              name: 'Temperature',
              hoverinfo: 'text',
              hovertext: temperatures.map((temp, i) => 
                `${times[i]}<br>Temp: ${formatTemp(temp)}<br>` +
                `${conditions[i]} ${getWeatherIcon(conditions[i])}<br>` +
                `Wind: ${windSpeeds[i]} km/h ${getWindDirection(windDirections[i])}`
              ),
            },
          ]}
          layout={{
            title: {
              text: `Weather Forecast`,
              font: { size: 14 }
            },
            xaxis: {
              title: 'Time',
              tickangle: -45,
              tickfont: { size: 8 },
              tickvals: times,
              ticktext: dayLabels,
            },
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
            annotations: temperatures.map((temp, i) => ({
              x: times[i],
              y: convertTemp(temp),
              text: getWeatherIcon(conditions[i]),
              showarrow: false,
              yshift: 8,
              font: { size: 10 }
            })),
          }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
      <div className="summaries">
        {limitedData.map((day, index) => (
          <div key={index} className="daily-summary">
            <h4 className="summary-header">{day.date}</h4>
            <p>{day.summary}</p>
          </div>
        ))}
      </div>
      <div className="legend">
        <p>🌡️ Temp: Blue (Cold) to Red (Hot) | ☁️ Cloudy | 🌧️ Rainy | ☀️ Sunny | ⛅ Partly Cloudy | ⛈️ Stormy | ❄️ Snowy | 💨 Wind: N, NE, E, SE, S, SW, W, NW</p>
      </div>
      <button className="toggle-button" onClick={() => setIsCelsius(!isCelsius)}>
        {isCelsius ? '°F' : '°C'}
      </button>
    </div>
  );
};

export default WeatherChart;