var app = angular.module("weatherApp", []);
app.controller("WeatherController", function ($scope, $http) {
    $scope.styleUrl = "default.css";
    $scope.date = new Date();
    $scope.showTable = false; // To control the visibility of the table
    $scope.showbutton=true;

$scope.retrieveData = function () {
        // Make an HTTP GET request to your server to fetch data from MongoDB
        $http.get('http://localhost:3000/api/retrieve', { responseType: 'json' }).then(function (response) {
    // Update the scope with the retrieved data
    $scope.retrievedData = response.data;
    $scope.showTable = true; // Show the table after data retrieval
  })
  .catch(function (error) {
    console.error('Error retrieving data:', error);
  });

    };
    $scope.getWeather = function () {
        var apiKey = "a0008ec76a89e6a0c8f671a2fa16da89";
        var apiUrl = "https://api.openweathermap.org/data/2.5/weather";
        const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';

        var params = {
            q: $scope.city,
            appid: apiKey,
            units: "metric" // for Celsius
        };

        $http.get(apiUrl, { params: params })
            .then(function (response) {
                $scope.weatherData = response.data;
                var weatherId = $scope.weatherData.weather[0].id;
                updateStylesheet(weatherId);
                saveWeatherDataToMongoDB($scope.weatherData);

                // Fetch image based on city
                fetchCityImage($scope.city);
            })
            .catch(function (error) {
                $scope.weatherData = null;
                $scope.errorMessage = "Error fetching weather data";
                console.error(error);
            });

            $http.get(`${baseUrl}?q=${$scope.city}&appid=${apiKey}`)
            .then(function (response) {
                const data = response.data;
                // Extract the daily forecast data for the next week
                const dailyForecasts = data.list.filter(entry => entry.dt_txt.includes('12:00:00'));

                // Transform and store the forecast data in the scope
                $scope.forecasts = dailyForecasts.map(forecast => {
                    const date = new Date(forecast.dt_txt);
                    const temperature = forecast.main.temp;
                    const description = forecast.weather[0].description;

                    return {
                        date: date,
                        description: description,
                        temperature: temperature
                    };
                });
            })
            .catch(function (error) {
                console.error('Error fetching weather data:', error);
            });
    };

    // Function to fetch image based on the city
    function fetchCityImage(city) {
        // Modify this URL to use your desired image API or source
        // You might want to replace 'YOUR_ACCESS_KEY' with a valid access key or use another API
        var imageUrl = `https://api.unsplash.com/photos/random?query=${city}&client_id=MtUET7g7oMosBSBAScdf-qcrhk9muONgtYO-xdhjwr0`;

        $http.get(imageUrl)
            .then(function (response) {
                // Update the image URL in your scope
                $scope.cityImageUrl = response.data.urls.regular;
            })
            .catch(function (error) {
                console.error('Error fetching city image:', error);
            });
    }
    function saveWeatherDataToMongoDB(weatherData) {
        // Adjust this part to send an HTTP POST request to your Node.js server
        // that handles MongoDB interactions. For example:
        var dataToSave = {
            date: $scope.date,
            city: $scope.city,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            humidity:weatherData.main.humidity,
            windspeed:weatherData.wind.speed
            // Add more data fields as needed
        };

        $http.post('http://localhost:3000/insertData', dataToSave)
            .then(function (response) {
                console.log('Weather data saved to MongoDB:', response.data);
            })
            .catch(function (error) {
                console.error('Error saving weather data to MongoDB:', error);
            });
    }

    function updateStylesheet(weatherCondition) {
        var stylesheet = "default.css"; // Default stylesheet

        if (weatherCondition >= 200 && weatherCondition <= 599) {
            $scope.showbutton=false;
            $scope.showTable=false;
            stylesheet = "rainstyle.css";
        } else if (weatherCondition === 800) {
            $scope.showbutton=false;
            $scope.showTable=false;
            stylesheet = "sunstyle.css";
        } else if (weatherCondition >= 801 && weatherCondition <= 899) {
            $scope.showbutton=false;
            $scope.showTable=false;
            stylesheet = "cloudsstyle.css";
        } else if (weatherCondition >= 700 && weatherCondition <= 799) {
            $scope.showbutton=false;
            $scope.showTable=false;
            stylesheet = "fog.css";
        }

        $scope.styleUrl = stylesheet;
    }
});
