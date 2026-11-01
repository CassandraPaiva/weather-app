console.log("Weather app loaded");

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const unitToggle = document.getElementById("unit-toggle");
const themeToggle = document.getElementById("theme-toggle");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

// App state: current unit and the last result we showed
let unit = "C";
let lastPlace = null;
let lastWeather = null;

// Turns Open-Meteo weather codes into readable text
function describeWeather(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Unknown";
}
// Add an emoji
function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code === 85 || code === 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}
// Formats a Celsius value in the currently selected unit
function formatTemperature(celsius) {
  if (unit === "F") {
    return Math.round(celsius * 9 / 5 + 32) + "°F";
  }
  return Math.round(celsius) + "°C";
}
// Shows a message under the search box
function showMessage(text, isError) {
  message.textContent = text;
  if (isError) {
    message.classList.add("error");
  } else {
    message.classList.remove("error");
  }
}

// Step A: city name -> coordinates
async function getCoordinates(city) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    "?name=" + encodeURIComponent(city) +
    "&count=1&language=en&format=json";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Geocoding request failed");
  }

  const data = await response.json();

  if (!data.results) {
    return null; // no city found
  }
  return data.results[0];
}

// Step B: coordinates -> weather
async function getWeather(latitude, longitude) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  const data = await response.json();
  return data;
}

// Step C: put the data on the card
function showWeather(place, weather) {
  const current = weather.current;
  const units = weather.current_units;

  cityName.textContent = place.name + ", " + place.country;
  weatherIcon.textContent = getWeatherEmoji(current.weather_code);
  temperature.textContent = formatTemperature(current.temperature_2m);
  conditions.textContent = describeWeather(current.weather_code);
  humidity.textContent = current.relative_humidity_2m + units.relative_humidity_2m;
  wind.textContent = current.wind_speed_10m + " " + units.wind_speed_10m;
}

// Looks up a city and shows its weather
async function searchCity(city) {
  if (city === "") {
    showMessage("Please enter a city name.", true);
    return;
  }

  showMessage("Loading...", false);

  try {
    const place = await getCoordinates(city);
    if (place === null) {
      showMessage('City "' + city + '" not found. Check the spelling and try again.', true);
      return;
    }

    const weather = await getWeather(place.latitude, place.longitude);
    lastPlace = place;
    lastWeather = weather;
    showWeather(place, weather);
    showMessage("", false);

    localStorage.setItem("lastCity", place.name);
  } catch (error) {
    console.error(error);
    showMessage("Could not get the weather. Check your internet connection and try again.", true);
  }
}

// Runs when the form is submitted (button click or Enter key)
form.addEventListener("submit", function (event) {
  event.preventDefault();
  searchCity(cityInput.value.trim());
});

// Switch between °C and °F
unitToggle.addEventListener("click", function () {
  unit = unit === "C" ? "F" : "C";
  unitToggle.textContent = unit === "C" ? "Switch to °F" : "Switch to °C";

  if (lastWeather !== null) {
    showWeather(lastPlace, lastWeather);
  }
});


// When the page loads, show the last searched city (if there is one)
const savedCity = localStorage.getItem("lastCity");
if (savedCity !== null) {
  cityInput.value = savedCity;
  searchCity(savedCity);
}


// Dark mode: apply a theme and update the button text
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙 Dark mode";
  }
}

themeToggle.addEventListener("click", function () {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

// On page load, use the saved theme (if there is one)
const savedTheme = localStorage.getItem("theme");
if (savedTheme !== null) {
  applyTheme(savedTheme);
}
