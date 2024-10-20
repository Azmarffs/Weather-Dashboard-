Weather Chatbot and Widget
This project is a Weather Chatbot and Widget that fetches weather data from the OpenWeatherMap API. The chatbot responds to weather-related queries, and the weather widget displays current weather information for a specific city. The project is built using HTML, CSS, and JavaScript.

Features
Weather Widget: Displays the current temperature, weather conditions, and an appropriate background image based on the weather.
Weather Chatbot: Responds to user queries about the weather in a specific city by displaying the current temperature and description of the weather.
Error Handling: Provides user-friendly error messages when the city or country name is invalid.
Prerequisites
Before you can run this project locally, ensure that you have the following:

A text editor (e.g., Visual Studio Code).
A modern web browser (e.g., Google Chrome, Mozilla Firefox).
A valid API key from OpenWeatherMap.
How to Run the Project Locally
Clone the Repository

To clone this project, open your terminal or command prompt and run the following command:

bash
Copy code
git clone https://github.com/azmarffs/weather-chatbot-widget.git
Alternatively, you can download the ZIP file from GitHub and extract it on your local machine.

Obtain an OpenWeatherMap API Key

Go to the OpenWeatherMap API page and sign up for an API key if you don't have one. You'll need to use this key to fetch the weather data.

Set Up the Project

Once the project is cloned or extracted, follow these steps:

Open the project folder in your preferred code editor.

Locate the script.js file and replace YOUR_API_KEY with your actual OpenWeatherMap API key.

javascript
Copy code
const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API Key
Run the Project

Simply open the index.html file in your web browser.
You can use a live server extension (e.g., the Live Server extension in VS Code) to make testing easier.
Type a city name in the chatbot or the widget input field to get the current weather data.
How It Works
Weather Widget: When a city name is entered, the weather widget fetches data from the OpenWeatherMap API and updates the display with the current weather and temperature. If the city name is invalid, an error message is shown.

Weather Chatbot: The chatbot listens for weather-related queries, processes the city name, and responds with the weather information for that location. If the city name is invalid, it informs the user.

Error Handling
If the API does not return data (e.g., due to a wrong city name), the system displays a user-friendly error message (e.g., "City not found").
File Structure
graphql
Copy code
weather-chatbot-widget/
│
├── index.html          # Main HTML file
├── style.css           # Styles for the project
├── script.js           # Main JavaScript file with API call logic
├── README.md           # This file
└── assets/             # Contains images or other resources
Dependencies
This project uses the following:

OpenWeatherMap API: For fetching weather data.
HTML, CSS, JavaScript: No external libraries are used in this project.
Future Improvements
Add support for more complex chatbot conversations.
Include additional weather details like wind speed, humidity, etc.
Improve the UI design for better user experience.
License
This project is licensed under the MIT License - see the LICENSE file for details.

