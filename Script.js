document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const apiKey = 'a161a6ee18e74f0e96f102820240506'; 
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weatherData = document.getElementById('weatherData');
            if (data) {
                weatherData.innerHTML = `
                    <h2>${data.location.name}, ${data.location.country}</h2>
                    <p>Temperature: ${data.current.temp_c} °C</p>
                    <p>Weather: ${data.current.condition.text}</p>
                    <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
                    <p>Humidity: ${data.current.humidity} %</p>
                    <p>Wind Speed: ${data.current.wind_kph} kph</p>
                `;
                fetchHistoricalData(city, apiKey);
            } else {
                weatherData.innerHTML = `<p>Error fetching data</p>`;
            }
        })
        .catch(error => {
            const weatherData = document.getElementById('weatherData');
            weatherData.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
        });
});

function fetchHistoricalData(city, apiKey) {
    const currentDate = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    const promises = dates.map(date => {
        const url = `http://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${date}`;
        return fetch(url).then(response => response.json());
    });

    Promise.all(promises)
        .then(results => {
            const temps = results.map(result => result.forecast.forecastday[0].day.avgtemp_c);
            const labels = results.map(result => result.forecast.forecastday[0].date);
            createChart(labels, temps);
        })
        .catch(error => console.error('Error fetching historical data:', error));
}

function createChart(labels, data) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}
