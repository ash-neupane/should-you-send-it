import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WeatherDashboard from './components/WeatherDashboard';
import About from './components/About';

const App: React.FC = () => (
  <Router>
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<WeatherDashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </div>
  </Router>
);

export default App;
