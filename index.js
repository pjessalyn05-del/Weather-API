// ito yung function para dun s apag vavalidate or check if tama ba yung ininput ni user
function validateCityInput(city) {
    if (!city || city.trim() === '') {
        return {
            valid: false,
            message: 'Please enter a city name'
        };
    }
    
    const trimmedCity = city.trim();
    
    if (trimmedCity.length < 2) {
        return {
            valid: false,
            message: 'City name must be at least 2 characters'
        };
    }
    
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(trimmedCity)) {
        return {
            valid: false,
            message: 'City name contains invalid characters'
        };
    }
    
    return {
        valid: true,
        value: trimmedCity
    };
}

// ito yung actual na function para pag fetch ng weather galing sa openweather api base sa input ni user
async function fetchWeatherData(cityName) {
    const apiKey = API_CONFIG.API_KEY;
    const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const units = 'metric';
    const url = baseUrl + '?q=' + encodeURIComponent(cityName) + '&appid=' + apiKey + '&units=' + units;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the city name and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }
        
        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        if (error.message) {
            return {
                success: false,
                message: error.message
            };
        } else {
            return {
                success: false,
                message: 'Network error. Please check your internet connection.'
            };
        }
    }
}

// ito naman yung function para dun s pag display ng  data sa html galing sa api
function displayWeatherData(weatherData) {
    const cityNameEl = document.getElementById('weatherCityName');
    const countryEl = document.getElementById('weatherCountry');
    const tempEl = document.getElementById('weatherTemp');
    const descriptionEl = document.getElementById('weatherDescription');
    const feelsLikeEl = document.getElementById('weatherFeelsLike');
    const humidityEl = document.getElementById('weatherHumidity');
    const windSpeedEl = document.getElementById('weatherWindSpeed');
    const visibilityEl = document.getElementById('weatherVisibility');
    const minTempEl = document.getElementById('weatherMinTemp');
    const maxTempEl = document.getElementById('weatherMaxTemp');
    const resultsEl = document.getElementById('weatherResults');
    
    cityNameEl.textContent = weatherData.name;
    countryEl.textContent = weatherData.sys.country;
    tempEl.textContent = Math.round(weatherData.main.temp);
    descriptionEl.textContent = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1);
    
    feelsLikeEl.textContent = Math.round(weatherData.main.feels_like) + '°C';
    humidityEl.textContent = weatherData.main.humidity + '%';
    windSpeedEl.textContent = weatherData.wind.speed + ' m/s';
    
    const visibilityKm = (weatherData.visibility / 1000).toFixed(1);
    visibilityEl.textContent = visibilityKm + ' km';
    
    minTempEl.textContent = Math.round(weatherData.main.temp_min) + '°C';
    maxTempEl.textContent = Math.round(weatherData.main.temp_max) + '°C';
    
    resultsEl.style.display = 'block';
}

// eto yung errors message
function showError(message) {
    const errorEl = document.getElementById('weatherError');
    const errorTextEl = document.getElementById('weatherErrorText');
    const resultsEl = document.getElementById('weatherResults');
    
    errorTextEl.textContent = message;
    errorEl.style.display = 'flex';
    resultsEl.style.display = 'none';
}


function hideAllStates() {
    const loadingEl = document.getElementById('weatherLoading');
    const errorEl = document.getElementById('weatherError');
    const resultsEl = document.getElementById('weatherResults');
    
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    resultsEl.style.display = 'none';
}


function showLoading() {
    const loadingEl = document.getElementById('weatherLoading');
    loadingEl.style.display = 'flex';
}


function setSearchButtonState(disabled) {
    const searchBtn = document.querySelector('.weather-search-btn');
    const cityInput = document.getElementById('cityInput');
    
    if (searchBtn) {
        searchBtn.disabled = disabled;
        if (disabled) {
            searchBtn.classList.add('weather-btn-loading');
        } else {
            searchBtn.classList.remove('weather-btn-loading');
        }
    }
    
    if (cityInput) {
        cityInput.disabled = disabled;
    }
}


async function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    const cityValue = cityInput.value;
    
    const validation = validateCityInput(cityValue);
    
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    hideAllStates();
    showLoading();
    setSearchButtonState(true);
    
    const result = await fetchWeatherData(validation.value);
    
    setSearchButtonState(false);
    
    if (result.success) {
        hideAllStates();
        displayWeatherData(result.data);
    } else {
        showError(result.message);
    }
}


function handleEnterKey(event) {
    if (event.key === 'Enter') {
        const searchBtn = document.querySelector('.weather-search-btn');
        if (searchBtn && !searchBtn.disabled) {
            searchWeather();
        }
    }
}
