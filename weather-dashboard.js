// Existing API key
const apiKey = 'f59383e51910b709ff51441faa3277e9';

// Global variables for pagination and temperature data
let currentPage = 1;
const entriesPerPage = 10;
let allForecasts = [];

// Array to hold weekly temperatures for calculation
let weeklyTemperatures = [];

// Weather condition to background mapping
const weatherBackgrounds = {
    '2xx': 'linear-gradient(to bottom, #20202c, #515175)',
    '3xx': 'linear-gradient(to bottom, #93a5cf, #e4efe9)',
    '5xx': 'linear-gradient(to bottom, #4b6cb7, #182848)',
    '6xx': 'linear-gradient(to bottom, #e6dada, #274046)',
    '7xx': 'linear-gradient(to bottom, #bdc3c7, #2c3e50)',
    '800': 'linear-gradient(to bottom, #56ccf2, #2f80ed)',
    '80x': 'linear-gradient(to bottom, #757f9a, #d7dde8)'
};

document.addEventListener('DOMContentLoaded', () => {
    // Event listener for search button
    document.getElementById('search-button').addEventListener('click', () => {
        const city = document.getElementById('city-input').value;
        if (city) {
            fetchWeatherDataForWidget(city);
            fetchWeatherForecast(city);
        }
    });

    // Event listeners for pagination
    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));

    // Event listener for sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            document.querySelectorAll('.main-content > div').forEach(div => {
                div.style.display = div.id === targetId ? 'block' : 'none';
            });
        });
    });

    // Event listener for chatbot
    document.getElementById('chatbot-send').addEventListener('click', handleChatbotInput);

    // Event listener for chatbot icon
    document.getElementById('chatbot-icon').addEventListener('click', () => {
        const chatbotPopup = document.getElementById('chatbot-popup');
        chatbotPopup.style.display = chatbotPopup.style.display === 'none' ? 'block' : 'none';
    });
});

async function fetchWeatherDataForWidget(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`);
        const data = await response.json();

        if (response.ok) {
            updateWeatherWidget(data);
            updateWidgetBackground(data.weather[0].id);
        } else if (response.status === 404) {
            // City not found, display user-friendly message
            alert(`City "${city}" not found. Please enter a valid city name.`);
        } else {
            // Other errors
            console.error('Error fetching weather data for widget:', data.message);
            alert('An error occurred while fetching weather data. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching weather data for widget:', error);
        alert('An unexpected error occurred. Please check your connection and try again.');
    }
}


async function fetchWeatherDataForChatbot(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`);
        const data = await response.json();
        const chatbotMessages = document.getElementById('chatbot-messages');

        if (response.ok) {
            const temp = Math.round(data.main.temp);
            const description = data.weather[0].description;
            chatbotMessages.innerHTML += `<p>Bot: The weather in ${city} is ${description} (${temp}°F).</p>`;
        } else if (response.status === 404) {
            chatbotMessages.innerHTML += `<p>Bot: City "${city}" not found. Please enter a valid city name.</p>`;
        } else {
            chatbotMessages.innerHTML += `<p>Bot: Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data for chatbot:', error);
        document.getElementById('chatbot-messages').innerHTML += "<p>Bot: I'm sorry, I couldn't fetch the weather data. Please try again later.</p>";
    }
}



function updateWeatherWidget(data) {
    const iconElement = document.getElementById('weather-icon');
    iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    iconElement.alt = data.weather[0].description;

    const temperature = `${Math.round(data.main.temp)}°C`;
    document.getElementById('temperature').textContent = temperature;

    const precipitation = data.rain ? `${data.rain['1h']}%` : '0%';
    document.getElementById('precipitation').textContent = `Precipitation: ${precipitation}`;

    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} km/h`;

    document.getElementById('weather-title').textContent = data.name;
    document.getElementById('time').textContent = new Date().toLocaleString();
    document.getElementById('weather-description').textContent = data.weather[0].description;
}

function updateWidgetBackground(weatherId) {
    const weatherWidget = document.querySelector('.weather-widget');
    let backgroundKey;

    if (weatherId >= 200 && weatherId < 300) {
        backgroundKey = '2xx';
    } else if (weatherId >= 300 && weatherId < 400) {
        backgroundKey = '3xx';
    } else if (weatherId >= 500 && weatherId < 600) {
        backgroundKey = '5xx';
    } else if (weatherId >= 600 && weatherId < 700) {
        backgroundKey = '6xx';
    } else if (weatherId >= 700 && weatherId < 800) {
        backgroundKey = '7xx';
    } else if (weatherId === 800) {
        backgroundKey = '800';
    } else if (weatherId > 800) {
        backgroundKey = '80x';
    }

    const backgroundImage = weatherBackgrounds[backgroundKey] || weatherBackgrounds['800'];
    weatherWidget.style.background = backgroundImage;
    weatherWidget.style.color = 'white';
    weatherWidget.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
}



function handleChatbotInput() {
    const input = document.getElementById('chatbot-input').value.toLowerCase();
    const chatbotMessages = document.getElementById('chatbot-messages');

    chatbotMessages.innerHTML += `<p>User: ${input}</p>`;

    if (input.includes('weather')) {
        const cityMatch = input.match(/in (\w+)/);
        if (cityMatch) {
            const city = cityMatch[1];
            chatbotMessages.innerHTML += `<p>Bot: Fetching weather data for ${city}...</p>`;
            fetchWeatherDataForChatbot(city);
        } else {
            chatbotMessages.innerHTML += `<p>Bot: Please specify a city. For example, "What's the weather in New York?"</p>`;
        }
    } else if (input.includes('highest') || input.includes('lowest') || input.includes('average')) {
        if (weeklyTemperatures.length > 0) {
            const stats = calculateWeatherStats();
            chatbotMessages.innerHTML += `<p>Bot: Based on the current forecast:</p>
                <p>Highest temperature: ${stats.highest}°C</p>
                <p>Lowest temperature: ${stats.lowest}°C</p>
                <p>Average temperature: ${stats.average}°C</p>`;
        } else {
            chatbotMessages.innerHTML += `<p>Bot: I'm sorry, but I don't have any temperature data available. Please search for a city first.</p>`;
        }
    } else if (input.includes('forecast')) {
        if (allForecasts.length > 0) {
            const nextForecast = allForecasts[0];
            const date = new Date(nextForecast.dt * 1000).toLocaleString();
            chatbotMessages.innerHTML += `<p>Bot: The next forecast is for ${date}. The temperature will be ${Math.round(nextForecast.main.temp)}°C with ${nextForecast.weather[0].description}.</p>`;
        } else {
            chatbotMessages.innerHTML += `<p>Bot: I'm sorry, but I don't have any forecast data available. Please search for a city first.</p>`;
        }
    } else {
        chatbotMessages.innerHTML += `<p>Bot: I can answer questions about the weather forecast, such as the highest, lowest, and average temperatures, or the next forecast. What would you like to know?</p>`;
    }

    document.getElementById('chatbot-input').value = '';
}

function createCharts(data) {
    const temperatures = data.list.map(item => item.main.temp);
    const labels = data.list.map(item => new Date(item.dt * 1000).toLocaleString());

    const barChart = new Chart(document.getElementById('vertical-bar-chart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const weatherConditions = data.list.map(item => item.weather[0].main);
    const weatherCount = weatherConditions.reduce((count, condition) => {
        count[condition] = (count[condition] || 0) + 1;
        return count;
    }, {});

    const doughnutChart = new Chart(document.getElementById('doughnut-chart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherCount),
            datasets: [{
                data: Object.values(weatherCount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        }
    });

    const lineChart = new Chart(document.getElementById('line-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function extractWeeklyTemperatures(data) {
    weeklyTemperatures = data.list.map(item => item.main.temp);
}

async function fetchWeatherForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            allForecasts = data.list;
            weeklyTemperatures = allForecasts.map(item => item.main.temp);
            currentPage = 1;
            updateForecastTable();
            createCharts(data);
        } else {
            displayError(`Error: ${data.message}. Please check the city name and try again.`);
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        displayError("Unable to fetch forecast data. Please try again later.");
    }
}

function updateForecastTable() {
    const forecastBody = document.getElementById('forecast-body');
    forecastBody.innerHTML = '';

    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;

    for (let i = startIndex; i < endIndex; i++) {
        if (i >= allForecasts.length) break; // Stop if we've reached the end of the forecast data
        
        const forecast = allForecasts[i];
        const row = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(forecast.dt * 1000).toLocaleString();

        const tempCell = document.createElement('td');
        tempCell.textContent = `${Math.round(forecast.main.temp)}°C`;

        const weatherCell = document.createElement('td');
        weatherCell.textContent = forecast.weather[0].description;

        const iconCell = document.createElement('td');
        const iconImg = document.createElement('img');
        iconImg.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        iconCell.appendChild(iconImg);

        row.appendChild(dateCell);
        row.appendChild(tempCell);
        row.appendChild(weatherCell);
        row.appendChild(iconCell);

        forecastBody.appendChild(row);
    }

    updatePaginationControls();
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    const maxPage = Math.ceil(allForecasts.length / 10);
    pageInfo.textContent = `Page ${currentPage} of ${maxPage}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === maxPage;
}

function changePage(delta) {
    const maxPage = Math.ceil(allForecasts.length / 10);
    currentPage = Math.max(1, Math.min(currentPage + delta, maxPage));
    updateForecastTable();
}

function calculateWeatherStats() {
    const temperatures = weeklyTemperatures.map(temp => parseFloat(temp));
    const highest = Math.max(...temperatures);
    const lowest = Math.min(...temperatures);
    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    return { highest, lowest, average: average.toFixed(2) };
}

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block'; // Ensure the error message is shown
    setTimeout(() => {
        errorElement.style.display = 'none'; // Hide the error message after 5 seconds
    }, 5000);
}