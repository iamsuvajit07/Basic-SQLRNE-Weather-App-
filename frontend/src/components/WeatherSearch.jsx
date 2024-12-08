/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const WeatherSearch = ({ token }) => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search-weather', { city, token });
      setWeatherData(response.data);
      setError('');
    } catch (err) {
      setError('Error fetching weather');
      setWeatherData(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Search Weather</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none"
        >
          Search
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}
        {weatherData && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-gray-700 text-center">
              Weather in {weatherData.city}
            </h3>
            <p className="text-gray-600 text-center">
              Temperature: <span className="font-medium">{weatherData.temperature}°C</span>
            </p>
            <p className="text-gray-600 text-center">
              Description: <span className="font-medium">{weatherData.description}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherSearch;
