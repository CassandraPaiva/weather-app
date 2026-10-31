console.log("Weather app loaded");

async function getWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=21.1458&longitude=79.0882" +
    "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";

  const response = await fetch(url);
  const data = await response.json();

  console.log("Full data:", data);
  console.log("Temperature:", data.current.temperature_2m);
}

getWeather();
