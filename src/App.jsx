import React, { useState } from "react";

// Icons for weather
import searchIcon from "../src/assets/search-removebg-preview.png";
import sunnyIcon from "../src/assets/Sunny.png";
import Night_Storm_icon from "../src/assets/NightStorm.png"; 
import NightClean_Icon from "../src/assets/Night_Clean.png";
import clearIcon from "../src/assets/PartlyCloudy.png";
import cloudsIcon from "../src/assets/cloudy-removebg-preview.png";
import rainIcon from "../src/assets/Rain.png";
import Heavy_Rain_Icon from "../src/assets/HeavyRain-removebg-preview.png";
import thunderIcon from "../src/assets/Thunderstorm.png";
import snowIcon from "../src/assets/Snow.png";
import mistIcon from "../src/assets/Mist.png";

const API_KEY = "8c1be050bec29505280ce5296ac856cd";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError("");

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();

      if (currentData.cod !== 200) throw new Error("City not found");
      setWeather(currentData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
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

  return (
    <div className="container">
      <div className="card">
        <h1>Weather Forecast</h1>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          <button className="search-button" onClick={fetchWeather}>
            <img src={searchIcon} alt="search" />
          </button>
        </div>

        {loading && <p className="loading">Loading...</p>}
        {error && !loading && <p className="error">{error}</p>}

        {weather && !loading && (
          <>
            {/* Current Weather */}
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

            {/* 7 Day Forecast */}
            <div className="forecast">
              {forecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>
                    {new Date(item.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={getWeatherIcon(item.weather[0].main)}
                    alt={item.weather[0].description}
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </>
        )}

        {!weather && !loading && !error && (
          <p className="placeholder">Enter a city to get started</p>
        )}
      </div>
    </div>
  );
};

export default App;