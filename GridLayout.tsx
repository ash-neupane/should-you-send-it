// import React from 'react';
// import { WiDaySunny, WiNightClear, WiCloudy } from 'react-icons/wi';
// import Plot from 'react-plotly.js';

// const WeatherIcon = ({ condition }) => {
//   switch (condition) {
//     case 'clear': return <WiDaySunny />;
//     case 'night-clear': return <WiNightClear />;
//     case 'cloudy': return <WiCloudy />;
//     default: return null;
//   }
// };

// const WindArrow = ({ speed, direction }) => (
//   <div style={{ transform: `rotate(${direction}deg)` }}>
//     →{speed}km/h
//   </div>
// );

// const TemperatureCell = ({ temp }) => (
//   <div style={{
//     backgroundColor: temp > 5 ? 'lightgreen' : 'lightblue',
//     padding: '5px',
//     textAlign: 'center'
//   }}>
//     {temp}°C
//   </div>
// );

// const MountainForecast = ({ data }) => {
//   return (
//     <div className="mountain-forecast">
//       <div className="elevation-info">
//         <h2>Elevations:</h2>
//         <p>Peak: 4345m</p>
//         <p>Mid: 3500m</p>
//         <p>Base: 2500m</p>
//       </div>
//       <div className="forecast-grid">
//         <div className="summary">
//           <h3>Days 1-3 Weather Summary</h3>
//           <p>{data.summary1_3}</p>
//           <h3>Days 4-6 Weather Summary</h3>
//           <p>{data.summary4_6}</p>
//         </div>
//         <table>
//           <thead>
//             <tr>
//               {data.days.map(day => (
//                 <th key={day.date} colSpan="3">{day.date}</th>
//               ))}
//             </tr>
//             <tr>
//               {data.days.map(day => (
//                 <React.Fragment key={day.date}>
//                   <th>AM</th>
//                   <th>PM</th>
//                   <th>night</th>
//                 </React.Fragment>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               {data.days.flatMap(day => [
//                 <td key={`${day.date}-am`}><WeatherIcon condition={day.am.condition} /></td>,
//                 <td key={`${day.date}-pm`}><WeatherIcon condition={day.pm.condition} /></td>,
//                 <td key={`${day.date}-night`}><WeatherIcon condition={day.night.condition} /></td>
//               ])}
//             </tr>
//             <tr>
//               {data.days.flatMap(day => [
//                 <td key={`${day.date}-am-wind`}><WindArrow {...day.am.wind} /></td>,
//                 <td key={`${day.date}-pm-wind`}><WindArrow {...day.pm.wind} /></td>,
//                 <td key={`${day.date}-night-wind`}><WindArrow {...day.night.wind} /></td>
//               ])}
//             </tr>
//             <tr>
//               {data.days.flatMap(day => [
//                 <td key={`${day.date}-am-temp`}><TemperatureCell temp={day.am.temp} /></td>,
//                 <td key={`${day.date}-pm-temp`}><TemperatureCell temp={day.pm.temp} /></td>,
//                 <td key={`${day.date}-night-temp`}><TemperatureCell temp={day.night.temp} /></td>
//               ])}
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div className="wave-height-map">
//         <Plot
//           data={[{
//             z: data.waveHeightData,
//             type: 'contour',
//             colorscale: 'Viridis'
//           }]}
//           layout={{ title: 'Wave Height Map', width: 500, height: 300 }}
//         />
//       </div>
//     </div>
//   );
// };

// export default GridLayout;