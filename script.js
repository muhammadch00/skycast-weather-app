
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");

function WeatherCondition(weatherCode) {

    let condition = "Unknown conditions";
    let icon = "🌡️";

    if (weatherCode === 0) {
        condition = "Clear sky";
        icon = "☀️";
    }
    else if (weatherCode === 1) {
        condition = "Mainly clear";
        icon = "🌤️";
    }
    else if (weatherCode === 2) {
        condition = "Partly cloudy";
        icon = "⛅";
    }
    else if (weatherCode === 3) {
        condition = "Overcast";
        icon = "☁️";
    }
    else if (weatherCode === 45 || weatherCode === 48) {
        condition = "Fog";
        icon = "🌫️";
    }
    else if (
        weatherCode === 51 ||
        weatherCode === 53 ||
        weatherCode === 55
    ) {
        condition = "Drizzle";
        icon = "🌦️";
    }
    else if (
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65
    ) {
        condition = "Rain";
        icon = "🌧️";
    }
    else if (
        weatherCode === 71 ||
        weatherCode === 73 ||
        weatherCode === 75
    ) {
        condition = "Snow";
        icon = "❄️";
    }
    else if (weatherCode === 95) {
        condition = "Thunderstorm";
        icon = "⛈️";
    }

    return {
        condition: condition,
        icon: icon
    };
}

weatherForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const cityInputValue = cityInput.value.trim();

    if (cityInputValue === "") {
        message.textContent = "Please enter a city name!";
        return;
    }

    message.textContent = "Loading weather...";

    const encodedCity = encodeURIComponent(cityInputValue);

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=1`;

    let cityName = "";

    fetch(geoUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to find city.");
            }

            return response.json();
        })

        .then(function (data) {
            if (!data.results || data.results.length === 0) {
                message.textContent = "City not found. Try another city.";
                return;
            }

            const location = data.results[0];

            const latitude = location.latitude;
            const longitude = location.longitude;

            cityName = location.name;

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

            return fetch(weatherUrl);
        })

        .then(function (response) {
            if (!response) {
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to fetch weather data.");
            }

            return response.json();
        })

        .then(function (weatherData) {
            if (!weatherData) {
                return;
            }

            const current = weatherData.current;
            const forecastGrid = document.getElementById("forecastGrid");
            const daily = weatherData.daily;

            // Clear previous forecast cards
            forecastGrid.innerHTML = "";

            // Generate 7-day forecast cards
            for (let i = 0; i < daily.time.length; i++) {

                const date = new Date(daily.time[i] + "T00:00:00");

                const day = date.toLocaleDateString("en-US", {
                    weekday: "short"
                }).toUpperCase();

                const maxTemp = Math.round(
                    daily.temperature_2m_max[i]
                );

                const minTemp = Math.round(
                    daily.temperature_2m_min[i]
                );

                const weatherCode = daily.weather_code[i];

                const condition = WeatherCondition(weatherCode);

                const card = document.createElement("article");

                card.className = "forecast-card";

                card.innerHTML = `
                    <p class="forecast-day">${day}</p>

                    <span class="forecast-icon" aria-hidden="true">
                        ${condition.icon}
                    </span>

                    <p class="forecast-condition">
                        ${condition.condition}
                    </p>

                    <p class="forecast-temp">
                        ${maxTemp}° <span>${minTemp}°</span>
                    </p>
                `;

                forecastGrid.appendChild(card);
            }

            // Current weather information
            document.getElementById("temperature").textContent =
                current.temperature_2m + " °C";

            document.getElementById("humidity").textContent =
                current.relative_humidity_2m + " %";

            document.getElementById("feelsLike").textContent =
                current.apparent_temperature + " °C";

            document.getElementById("windSpeed").textContent =
                current.wind_speed_10m + " km/h";

            const weatherCode = current.weather_code;

            const condition = WeatherCondition(weatherCode);

            document.getElementById("cityName").textContent =
                cityName;

            document.getElementById("condition").textContent =
                condition.condition;

            message.textContent = "Weather loaded successfully!";
        })

        .catch(function (error) {
            console.error("Error:", error);

            message.textContent =
                "Something went wrong. Please try again.";
        });
});

