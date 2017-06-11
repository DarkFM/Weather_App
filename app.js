    var globals = {
        location: {},
        countryISO: {},
        API_KEY: '5e87c8e1feeebf07eae117d7d3a2980b'

    }

    $(function () {

        var getLocation = (function getLocation() {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    globals.location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    getWeather();
                });
            } else {
                globals.location = {
                    lat: '',
                    lon: ''
                };
            }
        }());

        function getWeather() {
            var location = globals.location,
                usrInput = $('.input-div input').val() || '';

            getCityWeather(usrInput, location);
            getCityForecast(usrInput, location)

        }

        // gets weather from user input
        function getCityWeather(usrInput, location) {
            var locationArry = usrInput.split(',');
            city = locationArry[0] || '';
            country = locationArry[1] || '';
            var countryCode = getCountryCode(country, globals.countryISO);
            var unit = 'metric';

            $.ajax({
                type: 'GET',
                url: "http://api.openweathermap.org/data/2.5/weather",
                data: (usrInput) ? {
                    q: city + ',' + countryCode,
                    units: unit,
                    type: 'accurate',
                    APPID: globals.API_KEY
                } : {
                    APPID: globals.API_KEY,
                    lat: location.lat,
                    lon: location.lon,
                    units: unit
                },
                dataType: 'json',
                success: function (obj) {
                    displayWeatherInfo(obj);
                }
            });
        }

        // gets forecast of weather
        function getCityForecast(usrInput, location) {
            var locationArry = usrInput.split(',');
            city = locationArry[0] || '';
            country = locationArry[1] || '';
            var countryCode = getCountryCode(country, globals.countryISO);
            var unit = 'metric';
            $.ajax({
                type: 'GET',
                url: "http://api.openweathermap.org/data/2.5/forecast",
                data: (usrInput) ? {
                    q: city + ',' + countryCode,
                    units: unit,
                    type: 'accurate',
                    APPID: globals.API_KEY,
                    cnt: 8
                } : {
                    APPID: globals.API_KEY,
                    lat: location.lat,
                    lon: location.lon,
                    units: unit,
                    cnt: 16
                },
                dataType: 'json',
                success: displayNextDayForcast
            });
        }

        function displayNextDayForcast(obj) {
            var times = obj.list;
            var dateTime, nextDay, count = 0;
            var dayArry = [];
            var findNext9 = false;

            for (var i = 0, j = 2; i < times.length; i++) {
                dateTime = times[i].dt_txt.split(' ')
                nextDay = Number(dateTime[1].split(':')[0]);

                if(count === 3){
                    break;
                }

                switch (nextDay) {
                    case 9:
                        if(count === 0){
                            displayForecast(times);
                        }
                        // count =;
                        break;
                    case 15:
                        // dayArry.push(times[i]);
                        if(count === 1){
                            displayForecast(times);
                        }
                        break;
                    case 21:
                        // dayArry.push(times[i]);
                        if(count === 2){
                            displayForecast(times);
                        }                        
                        break;
                    default:
                        break;
                }

            };

            function displayForecast(times) {
                ++count;
                var temp = times[i].main.temp;
                // console.log(temp);
                $('.temp' + j).text(temp);
                console.log(temp);                
                console.log("-----------", j);                
                

                var current = times[i].weather[0].description;
                $('.info' + j + ' h3').text(current);

                var wind = times[i].wind.speed;
                $('.info' + j + ' .wind span[data-wind]').text(wind);

                var humidity = times[i].main.humidity;
                $('.info' + j + ' span[data-humidity]').text(humidity);
                j++;
            }

        }


        function displayWeatherInfo(obj) {

            var temp = obj.main.temp;
            // temp = Math.round(temp - 273.15);
            $('.current-temp .temp').text(temp);

            var city = obj.name
            $('.city-name p').text(city);

            var current = obj.weather[0].main;
            $('.toggle-info .current').text(current);

            var wind = obj.wind.speed;
            $('.current-details span[data-wind]').text(wind);

            var humidity = obj.main.humidity;
            $('.current-details span[data-humidity]').text(humidity);

        }


        // returns JSON of country codes
        (function getCountryISOjson() {
            $.ajax({
                type: 'GET',
                url: "http://api.geonames.org/countryInfo",
                data: {
                    username: "cbest",
                    type: "JSON",
                },
                dataType: 'json',
                success: function (obj) {
                    globals.countryISO = obj;
                }
            });

        }());

        // gets country code from locally sotered JSON
        function getCountryCode(country, obj) {
            if (!country) {
                return '';
            }
            country = country.trim().toLowerCase();
            // country = country.slice(0, 1).toUpperCase() + country.slice(1);

            for (var i = 0; i < obj.geonames.length; i++) {
                var countryName = obj.geonames[i]["countryName"].toLowerCase();
                if (countryName === country) {
                    return obj.geonames[i]["countryCode"];
                }
            }
            alert("Cannot find city/country name, Will attempt to use your current location");
            // getLocation();
        }

        // on click, update weather of city
        $('.submit-btn').on('click', function () {
            getWeather();
        });


    });