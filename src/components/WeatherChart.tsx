import React, { useState } from 'react';
import Plot from 'react-plotly.js';

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
  const limitedData = data.days.slice(0, 3);
  const times: string[] = [];
  const temperatures: number[] = [];
  const dayLabels: string[] = [];
  const conditions: string[] = [];
  const windSpeeds: number[] = [];
  const windDirections: number[] = [];

  const convertTemp = (temp: number) => isCelsius ? (temp - 32) * 5/9 : temp;
  const formatTemp = (temp: number) => `${Math.round(convertTemp(temp))}°${isCelsius ? 'C' : 'F'}`;

  limitedData.forEach((day, index) => {
    ['am', 'pm', 'night'].forEach(period => {
      if (day[period as keyof Pick<DayData, 'am' | 'pm' | 'night'>]) {
        const periodData = day[period as keyof Pick<DayData, 'am' | 'pm' | 'night'>] as WeatherPeriod;
        times.push(`${day.date} ${period.toUpperCase()}`);
        temperatures.push(periodData.temp);
        dayLabels.push(`${day.date} ${period.toUpperCase()}`);
        conditions.push(periodData.condition);
        windSpeeds.push(periodData.wind.speed);
        windDirections.push(periodData.wind.direction);
      }
    });
  });

  const getWeatherIcon = (condition: string) => {
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

  const getWindDirection = (degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degree / 45) % 8];
  };

  const styles = {
    weatherChart: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'rgb(240, 240, 240)',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      width: '100%',
    },
    summaries: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
    },
    dailySummary: {
      width: '32%',
      padding: '15px',
      boxSizing: 'border-box' as const,
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    summaryHeader: {
      marginTop: 0,
      color: 'rgb(255, 65, 54)',
      fontSize: '1.2em',
    },
    toggleButton: {
      marginBottom: '10px',
      padding: '5px 10px',
      fontSize: '14px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.weatherChart}>
      <button style={styles.toggleButton} onClick={() => setIsCelsius(!isCelsius)}>
        Toggle to {isCelsius ? '°F' : '°C'}
      </button>
      <Plot
        data={[
          {
            x: times,
            y: temperatures.map(convertTemp),
            type: 'scatter',
            mode: 'lines+markers',
            line: { 
              color: 'rgba(100, 149, 237, 0.5)',
              width: 2,
              dash: 'dot',
            },
            marker: { 
              color: temperatures.map(t => `rgb(${255 - Math.round((t - 32) * 5/9 * 5)}, 0, ${Math.round((t - 32) * 5/9 * 5)})`),
              size: 10,
              symbol: 'circle',
              line: {
                color: 'white',
                width: 2
              }
            },
            name: 'Temperature',
            hoverinfo: 'text',
            hovertext: temperatures.map((temp, i) => 
              `${times[i]}<br>Temperature: ${formatTemp(temp)}<br>` +
              `Condition: ${conditions[i]} ${getWeatherIcon(conditions[i])}<br>` +
              `Wind: ${windSpeeds[i]} km/h ${getWindDirection(windDirections[i])}`
            ),
          },
        ]}
        layout={{
          title: {
            text: `Forecast - ${isCelsius ? '°C' : '°F'}`,
            font: { size: 24, color: '#333' }
          },
          xaxis: {
            title: 'Time',
            tickangle: -45,
            tickfont: { size: 12 },
            tickvals: times,
            ticktext: dayLabels,
          },
          yaxis: { 
            title: `Temperature (${isCelsius ? '°C' : '°F'})`,
            gridcolor: 'rgba(0,0,0,0.1)',
          },
          autosize: true,
          margin: { l: 50, r: 50, b: 100, t: 80 },
          paper_bgcolor: 'rgb(240, 240, 240)',
          plot_bgcolor: 'rgb(250, 250, 250)',
          showlegend: false,
          hovermode: 'closest',
          annotations: temperatures.map((temp, i) => ({
            x: times[i],
            y: convertTemp(temp),
            text: getWeatherIcon(conditions[i]),
            showarrow: false,
            yshift: 20,
            font: { size: 24 }
          })),
        }}
        config={{ responsive: true }}
        style={{width: "100%", height: "100%"}}
      />
      <div style={styles.summaries}>
        {limitedData.map((day, index) => (
          <div key={index} style={styles.dailySummary}>
            <h4 style={styles.summaryHeader}>{day.date}</h4>
            <p>{day.summary}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop: '20px'}}>
        <h4>Legend:</h4>
        <p>🌡️ Temperature: Cooler (Blue) to Warmer (Red)</p>
        <p>☁️ Cloudy | 🌧️ Rainy | ☀️ Sunny | ⛅ Partly Cloudy | ⛈️ Stormy | ❄️ Snowy</p>
        <p>💨 Wind direction is shown in cardinal directions (N, NE, E, SE, S, SW, W, NW)</p>
      </div>
    </div>
  );
};

export default WeatherChart;
