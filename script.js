console.log("Weather app loaded");

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

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
  temperature.textContent = Math.round(current.temperature_2m) + units.temperature_2m;
  conditions.textContent = describeWeather(current.weather_code);
  humidity.textContent = current.relative_humidity_2m + units.relative_humidity_2m;
  wind.textContent = current.wind_speed_10m + " " + units.wind_speed_10m;
}

// Runs when the form is submitted (button click or Enter key)
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
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
    showWeather(place, weather);
    showMessage("", false);
  } catch (error) {
    console.error(error);
    showMessage("Could not get the weather. Check your internet connection and try again.", true);
  }
});
