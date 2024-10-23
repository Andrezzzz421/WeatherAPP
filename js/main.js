// Llamada para obtener el clima de Valledupar cuando se carga la página
window.addEventListener('load', () => {
    fetchWeatherData('Valledupar');
});

const apiKey = "5010d8e2d57f47de958173742242110";
const searchButton = document.getElementById('search-btn');
const searchInput = document.getElementById('search-city');
const weatherContainer = document.querySelector('.weather-container');
const weatherInfo = document.querySelector('.weather-info');
const locationText = document.getElementById('location');
const temperatureText = document.getElementById('temperature');
const conditionText = document.getElementById('condition');
const timeText = document.getElementById('time');
const weatherDescription = document.querySelector('.weather-description'); // Ajusta si es necesario


searchButton.addEventListener('click', () => {
    if (searchInput.classList.contains('hidden-input')) {
        searchInput.classList.remove('hidden-input');
        searchInput.classList.add('visible-input');
        searchInput.focus();
    } else {
        searchInput.classList.add('hidden-input');
        searchInput.classList.remove('visible-input');
    }
});

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const city = event.target.value;
        if (city) {
            fetchWeatherData(city);
        }
    }
});

async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`);
        const data = await response.json();

        locationText.textContent = `${data.location.name}, ${data.location.country}`;
        temperatureText.textContent = `${data.current.temp_c}°C`;
        conditionText.textContent = data.current.condition.text;

        timeText.textContent = new Date(data.location.localtime).toLocaleString('en-EN', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        document.getElementById('weather-icon').src = `https:${data.current.condition.icon}`;

        document.getElementById('feels-like').textContent = `${data.current.feelslike_c}°C`;
        document.getElementById('wind-speed').textContent = `${data.current.wind_kph} km/h`;
        document.getElementById('pressure').textContent = `${data.current.pressure_mb} hPa`;
        document.getElementById('uv-index').textContent = data.current.uv;
        document.getElementById('rain-chance').textContent = `${data.current.precip_mm} mm`;

        // Parsear las horas de salida y puesta del sol
        const sunrise = data.forecast.forecastday[0].astro.sunrise;
        const sunset = data.forecast.forecastday[0].astro.sunset;

        document.getElementById('sunrise-time').textContent = convertTo24HourFormat(sunrise);
        document.getElementById('sunset-time').textContent = convertTo24HourFormat(sunset);

        updateHourlyForecast(data.forecast.forecastday[0].hour);
        createRainChart(data.forecast.forecastday[0].hour); // Llamar a la función para crear el gráfico de lluvia

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("No se pudo encontrar la ciudad. Intenta de nuevo.");
    }
}

function convertTo24HourFormat(time) {
    const [hourMinute, modifier] = time.split(' '); // Dividir la hora y el modificador (AM/PM)
    let [hours, minutes] = hourMinute.split(':'); // Separar horas y minutos

    if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12; // Convertir a 24 horas
    } else if (modifier === 'AM' && hours === '12') {
        hours = '00'; // Convertir 12 AM a 00 horas
    }

    return `${hours}:${minutes}`; // Retornar el formato en 24 horas
}

function updateHourlyForecast(hourlyData) {
    const currentHour = new Date().getHours();
    const hourlyForecastContainer = document.querySelector('.hourly-forecast');
    hourlyForecastContainer.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const hourData = hourlyData[currentHour + i];
        if (hourData) {
            const hourItem = document.createElement('div');
            hourItem.classList.add('hour-item');
            hourItem.innerHTML = `
                <span class="hour-label">${new Date(hourData.time).getHours()}:00</span>
                <img src="https:${hourData.condition.icon}" alt="Weather Icon" class="hour-icon">
                <span class="hour-temp">${hourData.temp_c}°C</span>
            `;
            hourlyForecastContainer.appendChild(hourItem);
        }
    }
}

// Evento para ocultar el header al hacer scroll
window.addEventListener('scroll', function() {
    const textElements = document.querySelectorAll('#location, #temperature, #condition, #time, .search-icon');

    if (window.scrollY > 60) {
        // Cambia el color de la fuente a negro al hacer scroll
        textElements.forEach(el => {
            el.style.color = 'black'; // Cambia el color del texto a negro
        });

        weatherContainer.style.backgroundColor = '#e1d3fa'; // Cambia el color de fondo
        weatherContainer.style.backgroundImage = "none";
        weatherContainer.style.height = '150px'; // Ajusta el tamaño del weather-container

        // Ocultar la descripción del clima
        weatherDescription.style.display = 'none'; 
    } else {
        // Restaura el color de la fuente original (blanco)
        textElements.forEach(el => {
            el.style.color = 'white'; // Cambia el color del texto a blanco
        });

        // Vuelve al fondo original
        weatherContainer.style.backgroundImage = "url(../storage/img/background.png)"; // Regresa a la imagen de fondo
        weatherContainer.style.height = 'calc(70vh - env(safe-area-inset-bottom))'; // Altura original

        // Mostrar nuevamente la descripción del clima
        weatherDescription.style.display = 'block'; 
    }
});

function createRainChart(hourlyData) {
    const rainChanceContainer = document.querySelector('.rain-chance-graph');
    rainChanceContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos datos

    const currentHour = new Date().getHours();

    for (let i = 0; i < 4; i++) {
        const hourData = hourlyData[currentHour + i];
        if (hourData) {
            const rainChance = hourData.chance_of_rain; // Obtener el porcentaje de lluvia
            const hourLabel = new Date(hourData.time).getHours() + ':00';

            const rainBar = document.createElement('div');
            rainBar.classList.add('rain-bar');
            rainBar.innerHTML = `
                <span>${hourLabel}</span>
                <div style="width: ${rainChance}%;"></div>
                <span class="rain-percentage">${rainChance}%</span>
            `;
            rainChanceContainer.appendChild(rainBar);
        }
    }
}
