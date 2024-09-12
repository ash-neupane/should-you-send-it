import React from 'react';
import Plot from 'react-plotly.js';

interface WeatherData {
  properties: {
    periods: Array<{
      startTime: string;
      temperature: number;
    }>;
  };
}

interface WeatherChartProps {
  data: WeatherData;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const periods = data.properties.periods.slice(0,70);
  const temperatures = periods.map(period => period.temperature);
  const times = periods.map(period => period.startTime);

  return (
    <Plot
      data={[
        {
          x: times,
          y: temperatures,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'red' },
        },
      ]}
      layout={{
        title: 'Temperature Forecast',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Temperature (°F)' },
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default WeatherChart;