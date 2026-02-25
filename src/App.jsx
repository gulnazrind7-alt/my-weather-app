// App.jsx
import React, { useEffect, useState, useRef } from "react";
import searchIcon from "./assets/search-removebg-preview.png";
import sunnyIcon from "./assets/Sunny.png";
import Night_Storm_icon from "./assets/NightStorm.png";
import NightClean_Icon from "./assets/Night_Clean.png";
import clearIcon from "./assets/PartlyCloudy.png";
import cloudsIcon from "./assets/Cloudy-removebg-preview.png";
import rainIcon from "./assets/Rain.png";
import Heavy_Rain_Icon from "./assets/HeavyRain-removebg-preview.png";
import thunderIcon from "./assets/Thunderstorm.png";
import snowIcon from "./assets/Snow.png";
import mistIcon from "./assets/Mist.png";

const API_KEY = import.meta.env.VITE_API_KEY;

const App = () => {
  const searchRef = useRef(null);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // debounce helper for smoother API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      // only cities, show name + state + country
      const filtered = data.filter((item) => item.name);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (err) {
      console.log("Suggestion error:", err);
    }
  };

  const fetchSuggestionsDebounced = debounce(fetchSuggestions, 200);

  const fetchWeather = async () => {
    if (!city) return;
    try {
      setLoading(true);
      setError("");
      setShowSuggestions(false);

      // current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();
      if (currentData.cod !== 200) throw new Error("City not found");
      setWeather(currentData);

      // 7-day forecast (API returns 5-day/3h forecast)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();
      if (forecastData.cod !== "200") throw new Error("Forecast error");

      const dailyMap = {};
      forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap[date]) dailyMap[date] = item;
      });

      setForecast(Object.values(dailyMap).slice(0, 7));
    } catch (err) {
      setError("City not found or API error!");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (main) => {
    if (main === "Clear") return clearIcon;
    else if (main === "Sunny") return sunnyIcon;
    else if (main === "Night Storm") return Night_Storm_icon;
    else if (main === "NightClear") return NightClean_Icon;
    else if (main === "Clouds") return cloudsIcon;
    else if (main === "Rain" || main === "Drizzle") return rainIcon;
    else if (main === "Heavy Rain") return Heavy_Rain_Icon;
    else if (main === "Thunderstorm") return thunderIcon;
    else if (main === "Snow") return snowIcon;
    else if (main === "Mist" || main === "Haze" || main === "Fog") return mistIcon;
    else return clearIcon;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>Weather Forecast</h1>

        {/* Search */}
        <div className="search-bar" ref={searchRef}>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              fetchSuggestionsDebounced(e.target.value);
            }}
            onFocus={() => city && setShowSuggestions(true)}
            placeholder="Search city..."
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          <button className="search-button" onClick={fetchWeather}>
            <img src={searchIcon} alt="search" />
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setCity(`${item.name}, ${item.country}`);
                    setShowSuggestions(false);
                    setTimeout(fetchWeather, 100);
                  }}
                >
                  {item.name}
                  {item.state ? `, ${item.state}` : ""}, {item.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <p className="loading">Loading...</p>}
        {error && !loading && <p className="error">{error}</p>}

        {weather && !loading && (
          <>
            <div className="current-weather">
              <div className="weather-info">
                <img src={getWeatherIcon(weather.weather[0].main)} alt="weather" />
                <h2>{Math.round(weather.main.temp)}°C</h2>
                <p>{weather.name}</p>
                <p>{weather.weather[0].description}</p>
              </div>
              <div className="weather-stats">
                <div className="stat">
                  <p>Feels Like</p>
                  <h3>{Math.round(weather.main.feels_like)}°C</h3>
                </div>
                <div className="stat">
                  <p>Humidity</p>
                  <h3>{weather.main.humidity}%</h3>
                </div>
                <div className="stat">
                  <p>Wind Speed</p>
                  <h3>{weather.wind.speed} m/s</h3>
                </div>
                <div className="stat">
                  <p>Min / Max</p>
                  <h3>
                    {Math.round(weather.main.temp_min)}°C / {Math.round(weather.main.temp_max)}°C
                  </h3>
                </div>
              </div>
            </div>

            <div className="forecast">
              {forecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>
                    {new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <img src={getWeatherIcon(item.weather[0].main)} alt={item.weather[0].description} />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!weather && !loading && !error && <p className="placeholder">Enter a city to get started</p>}
      </div>
    </div>
  );
};

export default App;