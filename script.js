console.log("Weather app loaded");

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

// Step A: city name -> coordinates
async function getCoordinates(city) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    "?name=" + encodeURIComponent(city) +
    "&count=1&language=en&format=json";

  const response = await fetch(url);
  const data = await response.json();

  console.log("Geocoding data:", data);

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
  const data = await response.json();
  return data;
}

// Runs when the form is submitted (button click or Enter key)
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (city === "") {
    return;
  }

  const place = await getCoordinates(city);
  if (place === null) {
    console.log("City not found");
    return;
  }

  console.log("Found:", place.name, place.country, place.latitude, place.longitude);

  const weather = await getWeather(place.latitude, place.longitude);
  console.log("Weather:", weather);
});
