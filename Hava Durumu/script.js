let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = '061ef5979bcceb45fe80c80a84a1e4d9',
    currentWeatherCard = document.querySelector('.current-weather .card'),
    forecastGrid = document.querySelector('.forecast-grid'),
    hourlyGrid = document.querySelector('.hourly-grid'),
    airQualityCard = document.querySelector('.air-quality'),
    humidity = document.getElementById('humidity'),
    pressure = document.getElementById('pressure'),
    visibility = document.getElementById('visibility'),
    wind = document.getElementById('wind'),
    feelsLike = document.getElementById('feels-like'),
    sunrise = document.getElementById('sunrise'),
    sunset = document.getElementById('sunset'),
    pm25 = document.getElementById('pm25'),
    pm10 = document.getElementById('pm10'),
    aqiList = ['Çok İyi', 'İyi', 'Orta', 'Kötü', 'Çok Kötü'];

function getWeatherDetails(name, lat, lon, country) {
    let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
        FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
        AIRPOLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
        days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`Hava durumu API hatası: ${res.status}`);
            return res.json();
        })
        .then(data => {
            let date = new Date(),
                { temp, feels_like, humidity: hum, pressure: pres } = data.main,
                { speed } = data.wind,
                { sunrise: sr, sunset: ss, visibility: vis } = data.sys;

            currentWeatherCard.innerHTML = `
                <h2 class="city-name">${name}, ${country}</h2>
                <div class="weather-main">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="" class="weather-icon">
                    <div class="temp-info">
                        <p class="temp">${temp}°C</p>
                        <p class="description">${data.weather[0].description}</p>
                    </div>
                </div>
                <div class="weather-meta">
                    <p><i class="fa light fa-calendar"></i> <span class="date">${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}</span></p>
                </div>
                <div class="forecast-section">
                    <h3>5 Günlük Tahmin</h3>
                    <div class="forecast-grid"></div>
                </div>`;

            humidity.textContent = `${hum}%`;
            pressure.textContent = `${pres} hPa`;
            visibility.textContent = `${(vis / 1000).toFixed(1)} km`;
            wind.textContent = `${speed} m/s`;
            feelsLike.textContent = `${feels_like}°C`;
            sunrise.textContent = moment.unix(sr).format('HH:mm');
            sunset.textContent = moment.unix(ss).format('HH:mm');

        
            let newForecastGrid = document.querySelector('.forecast-grid');
            fetch(FORECAST_API_URL)
                .then(res => {
                    if (!res.ok) throw new Error(`Tahmin API hatası: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    let uniqueDays = [];
                    newForecastGrid.innerHTML = '';
                    data.list.forEach(f => {
                        let day = new Date(f.dt_txt).getDate();
                        if (!uniqueDays.includes(day) && uniqueDays.length < 5) {
                            uniqueDays.push(day);
                            newForecastGrid.innerHTML += `
                                <div>
                                    <img src="https://openweathermap.org/img/wn/${f.weather[0].icon}.png" alt="">
                                    <span>${f.main.temp}°C</span>
                                    <p>${moment(f.dt_txt).format('DD MMM')}</p>
                                    <p>${days[new Date(f.dt_txt).getDay()]}</p>
                                </div>`;
                        }
                    });

                    hourlyGrid.innerHTML = '';
                    data.list.slice(0, 8).forEach(f => {
                        hourlyGrid.innerHTML += `
                            <div>
                                <p>${moment(f.dt_txt).format('HH:mm')}</p>
                                <img src="https://openweathermap.org/img/wn/${f.weather[0].icon}.png" alt="">
                                <span>${f.main.temp}°C</span>
                            </div>`;
                    });
                })
                .catch(err => alert(`Tahmin verileri alınamadı: ${err.message}`));
        })
        .catch(err => alert(`Hava durumu verileri alınamadı: ${err.message}`));

    fetch(AIRPOLLUTION_API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`Hava kalitesi API hatası: ${res.status}`);
            return res.json();
        })
        .then(data => {
            let { pm2_5, pm10: pm_10 } = data.list[0].components,
                aqi = data.list[0].main.aqi;
            airQualityCard.innerHTML = `
                <h3>Hava Kalitesi</h3>
                <p class="air-index aqi-${aqi}">${aqiList[aqi - 1]}</p>
                <div class="air-grid">
                    <div class="air-item">
                        <p>PM2.5</p>
                        <span id="pm25">${pm2_5}</span>
                    </div>
                    <div class="air-item">
                        <p>PM10</p>
                        <span id="pm10">${pm_10}</span>
                    </div>
                </div>`;
        })
        .catch(err => alert(`Hava kalitesi verileri alınamadı: ${err.message}`));
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    if (!cityName) return alert('Lütfen bir şehir adı girin');
    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) throw new Error('Şehir bulunamadı');
            let { name, lat, lon, country } = data[0];
            getWeatherDetails(name, lat, lon, country);
        })
        .catch(err => alert(`Şehir koordinatları alınamadı: ${err.message}`));
}

function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(
        position => {
            let { latitude, longitude } = position.coords;
            let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    let { name, country } = data[0];
                    getWeatherDetails(name, latitude, longitude, country);
                });
        },
        () => alert('Konum izni reddedildi')
    );
}

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
window.addEventListener('load', getUserCoordinates);