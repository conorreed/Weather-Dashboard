//GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

const apiKey = "6376e7a506e8e7aec86c7392c3ee155a";
const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=${apiKey}`;
const cityName = "London";
let searchHistorySlots = [];

function populateSearchHistorySlots() {
  // look in local storage for previous search data
  searchHistorySlots = [];
  const parentElement = document.getElementById("search-history");
  if (parentElement) {
    const childElements = parentElement.children;
    for (let i = 0; i < childElements.length; i++) {
      const entry = localStorage.getItem(i.toString());
      if (entry) {
        searchHistorySlots.push(entry);
        childElements[i].visibility = "visible";
        childElements[i].textContent = entry;
        childElements[i].addEventListener("click", (event) => { 
            searchForCity(event.target.textContent);
        });
      } else {
        childElements[i].style.visibility = "hidden";
      }
    }
  }
}

function hideElements() {
  const rightPane = document.getElementById("right-pane");
  if (rightPane) {
    rightPane.style.display = "none";
  }
}

function showElements() {
  const rightPane = document.getElementById("right-pane");
  if (rightPane) {
    rightPane.style.display = "block";
  }
}

function pushToHistory(cityName) {
  if (searchHistorySlots.findIndex((item) => item === cityName) === -1) {
    const length = searchHistorySlots.push(cityName);
    localStorage.setItem(length - 1, cityName);
    populateSearchHistorySlots();
  }
}

function setup() {
  // hide parts of the page on startup

  populateSearchHistorySlots();
  hideElements();

  // add event handlers for buttons
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", () => {
    // Function to be executed when the button is clicked
    console.log("Button clicked!");
    const input = document.getElementById("city-input");
    if (input.value) {
      searchForCity(input.value);
    }
    // Call any other functions or perform actions you want here
  });
}

function searchForCity(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Process the weather data
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
      console.log("Weather Data:", data);
      fetch(weatherURL)
        .then((response) => response.json())
        .then((fiveDayForecast) => {
          showElements();
          const title = document.getElementById("selected-city-title");
          title.textContent = cityName;
          // Process data for 5 day forecast
          console.log("Weather Data:", fiveDayForecast);
          const dailyAverages = calculateDailyAverages(fiveDayForecast);
          for (let day = 0; day < 6; day++) {
            const dayData = dailyAverages[day];
            const date = document.getElementById(`day${day}-date`);
            if (date) {
              date.textContent = dayjs(dayData.date).format("M/D/YYYY");
            } else {
              debugger;
            }

            const temp = document.getElementById(`day${day}-city-temp`);
            temp.textContent = `Temp: ${dayData.averageTemperature.toFixed(
              2
            )}° F`;

            const wind = document.getElementById(`day${day}-city-wind`);
            wind.textContent = `Wind: ${dayData.averageWindSpeed.toFixed(
              2
            )} MPH`;

            const humidity = document.getElementById(`day${day}-city-humidity`);
            humidity.textContent = `Humidity: ${dayData.averageHumidity.toFixed(
              0
            )} %`;
          }

          pushToHistory(cityName);
        })
        .catch((error) => console.error("Error fetching weather data:", error));
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}


function calculateDailyAverages(forecastData) {
  const dailyAverages = [];

  // Group data by day
  const groupedData = {};
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000); // Convert Unix timestamp to JavaScript Date
    const day = date.toDateString();

    if (!groupedData[day]) {
      groupedData[day] = {
        temperatures: [],
        windSpeeds: [],
        humidities: [],
      };
    }

    groupedData[day].temperatures.push(item.main.temp);
    groupedData[day].windSpeeds.push(item.wind.speed);
    groupedData[day].humidities.push(item.main.humidity);
  });

  // Calculate averages for each day
  for (const day in groupedData) {
    const temps = groupedData[day].temperatures;
    const winds = groupedData[day].windSpeeds;
    const hums = groupedData[day].humidities;

    const averageTemp =
      temps.reduce((acc, temp) => acc + temp, 0) / temps.length;
    const averageWind =
      winds.reduce((acc, wind) => acc + wind, 0) / winds.length;
    const averageHumidity =
      hums.reduce((acc, humidity) => acc + humidity, 0) / hums.length;

    dailyAverages.push({
      date: day,
      averageTemperature: averageTemp,
      averageWindSpeed: averageWind,
      averageHumidity: averageHumidity,
    });
  }

  return dailyAverages;
}

document.addEventListener("DOMContentLoaded", (event) => {
  // This function will be called when the DOM is ready

  // Call your function here
  setup();
});
