import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState([]);

  const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Fetch current weather
  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: searchCity,
          units: 'metric',
          appid: API_KEY,
        },
      });
      setWeather(response.data);
      fetchForecast(response.data.coord.lat, response.data.coord.lon);
    } catch (err) {
      setError('City not found or API error. Please try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch 5-day forecast
  const fetchForecast = async (lat, lon) => {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          units: 'metric',
          appid: API_KEY,
        },
      });
      // Get one forecast per day (every 8th item, as API returns 3-hour intervals)
      const dailyForecasts = response.data.list.filter((_, index) => index % 8 === 0);
      setForecast(dailyForecasts);
    } catch (err) {
      console.error('Forecast fetch error:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  // Quick city buttons
  const quickCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];

  return (
    <div className="weather-dashboard">
      <div className="container">
        <header className="header">
          <h1>🌤️ Weather Dashboard</h1>
          <p>Real-time weather information</p>
        </header>

        {/* Search Bar */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={city}
              onChange={handleInputChange}
              placeholder="Enter city name..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          {/* Quick City Buttons */}
          <div className="quick-cities">
            {quickCities.map((quickCity) => (
              <button
                key={quickCity}
                className="quick-city-btn"
                onClick={() => {
                  setCity(quickCity);
                  fetchWeather(quickCity);
                }}
              >
                {quickCity}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && <div className="loading">Loading weather data...</div>}

        {/* Error State */}
        {error && <div className="error">{error}</div>}

        {/* Current Weather */}
        {weather && !loading && (
          <div className="current-weather">
            <div className="weather-header">
              <h2>{weather.name}, {weather.sys.country}</h2>
              <p className="timestamp">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="weather-main">
              <div className="temperature-section">
                <div className="temperature">
                  <span className="temp-value">{Math.round(weather.main.temp)}°C</span>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].main}
                    className="weather-icon"
                  />
                </div>
                <div className="weather-description">
                  <p className="condition">{weather.weather[0].main}</p>
                  <p className="description">{weather.weather[0].description}</p>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="weather-details-grid">
                <div className="detail-card">
                  <span className="detail-icon">💧</span>
                  <p className="detail-label">Humidity</p>
                  <p className="detail-value">{weather.main.humidity}%</p>
                </div>

                <div className="detail-card">
                  <span className="detail-icon">💨</span>
                  <p className="detail-label">Wind Speed</p>
                  <p className="detail-value">{weather.wind.speed} m/s</p>
                </div>

                <div className="detail-card">
                  <span className="detail-icon">🌡️</span>
                  <p className="detail-label">Feels Like</p>
                  <p className="detail-value">{Math.round(weather.main.feels_like)}°C</p>
                </div>

                <div className="detail-card">
                  <span className="detail-icon">🔽</span>
                  <p className="detail-label">Pressure</p>
                  <p className="detail-value">{weather.main.pressure} hPa</p>
                </div>

                <div className="detail-card">
                  <span className="detail-icon">👁️</span>
                  <p className="detail-label">Visibility</p>
                  <p className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</p>
                </div>

                <div className="detail-card">
                  <span className="detail-icon">☁️</span>
                  <p className="detail-label">Cloudiness</p>
                  <p className="detail-value">{weather.clouds.all}%</p>
                </div>
              </div>

              {/* Min/Max Temperature */}
              <div className="temp-range">
                <div className="temp-item">
                  <span className="temp-label">Max</span>
                  <span className="temp-number">{Math.round(weather.main.temp_max)}°C</span>
                </div>
                <div className="temp-item">
                  <span className="temp-label">Min</span>
                  <span className="temp-number">{Math.round(weather.main.temp_min)}°C</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && !loading && (
          <div className="forecast-section">
            <h3>5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <p className="forecast-date">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].main}
                    className="forecast-icon"
                  />
                  <p className="forecast-condition">{day.weather[0].main}</p>
                  <div className="forecast-temps">
                    <span className="forecast-temp-max">{Math.round(day.main.temp_max)}°</span>
                    <span className="forecast-temp-min">{Math.round(day.main.temp_min)}°</span>
                  </div>
                  <p className="forecast-humidity">💧 {day.main.humidity}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
