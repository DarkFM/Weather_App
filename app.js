    var globals = {
        location: {},
        countryISO: {},
        API_KEY: '5e87c8e1feeebf07eae117d7d3a2980b'
    }

    // $(function () {

    $.ajax({
        type: 'GET',
        url: "https://freegeoip.net/json/?",
        jsonpCallback: 'usrLocation',
        dataType: "jsonp",

    });

    function usrLocation(data) {
        globals.location.ip = data.ip;
        globals.location.lat = data.latitude;
        globals.location.lon = data.longitude;

        getWeather();
    }


    // var getLocation = (function getLocation() {

    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(function (position) {
    //             globals.location = {
    //                 lat: position.coords.latitude,
    //                 lon: position.coords.longitude
    //             };
    //             getWeather();
    //         });
    //     } else {
    //         globals.location = {
    //             lat: '',
    //             lon: ''
    //         };
    //     }
    // }());

    // populates all data fields
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

        $.ajax({
            type: 'GET',
            url: "http://api.openweathermap.org/data/2.5/weather",
            data: (usrInput) ? {
                q: city + ',' + countryCode,
                units: "metric",
                type: 'accurate',
                APPID: globals.API_KEY
            } : {
                APPID: globals.API_KEY,
                lat: location.lat,
                lon: location.lon,
                units: "metric"
            },
            dataType: 'jsonp',
            jsonpCallback: "displayWeatherInfo"

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
                cnt: 16
            } : {
                APPID: globals.API_KEY,
                lat: location.lat,
                lon: location.lon,
                units: unit,
                cnt: 16
            },
            jsonpCallback: "displayNextDayForcast",
            dataType: 'jsonp',
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

            if (count === 3) {
                break;
            }

            switch (nextDay) {
                case 9:
                    if (count === 0) {
                        displayForecast(times);
                        $('.next-day h2+p').text(dateTime[0]);
                    }
                    break;
                case 15:
                    if (count === 1) {
                        displayForecast(times);
                    }
                    break;
                case 21:
                    if (count === 2) {
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
            $('.temp' + j).text(temp);

            var current = times[i].weather[0].description;
            $('.info' + j + ' h3').text(current);

            var wind = times[i].wind.speed;
            $('.info' + j + ' .wind span[data-wind]').text(wind);

            var humidity = times[i].main.humidity;
            $('.info' + j + ' span[data-humidity]').text(humidity);

            var weatherIconId = times[i].weather[0].icon;
            var weatherURL = "http://openweathermap.org/img/w/" +
                weatherIconId + ".png";

            var weatherImg = "<img src='" + weatherURL + "' class='icon-img'>";
            $('.icon' + j).html(weatherImg);

            j++;
        }

    }


    function displayWeatherInfo(obj) {

        var temp = obj.main.temp;
        $('.current-temp .temp').text(temp);

        var weatherIconId = obj.weather[0].icon;
        var weatherURL = "http://openweathermap.org/img/w/" +
            weatherIconId + ".png";

        var weatherImg = "<img src='" + weatherURL + "' class='icon-img'>";
        $('.current-icon div').html(weatherImg);

        var city = obj.name
        $('.current-details header h2').text(city);

        var current = obj.weather[0].description;
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
                type: "JSON"
            },
            jsonpCallback: "countryISO",
            dataType: 'jsonp'
        });

    }());

    function countryISO(obj) {
        globals.countryISO = obj;
    }

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
        var cel = "C\xB0";
        var far = "F\xB0";
        var currentUnit = $(".toggle-units").text();

        if (currentUnit == cel) {
            var symbol = $('.units');
            $(".toggle-units").text(far)

            for (var i = 0; i < symbol.length; i++) {
                $(symbol[i]).text('C');
            }
        }
    });

    var weather_div = $('section.weather-div:not(".current")');
    weather_div.click(function () {
        // remove "active" and "active-weather-icon" classes from all selected divs
        for (var i = 0; i < weather_div.length; i++) {
            var element = weather_div[i];
            $(element).removeClass('active');
            // $('.weather-icon div').removeClass('.active-weather-icon');
            var weatherIconDiv = document.querySelector(".icon" + (i + 2));
            weatherIconDiv.classList.remove('active-weather-icon');
        }
        // adds class to clicked element
        $(this).addClass('active');

        this.querySelector(".weather-icon div").classList
            .add("active-weather-icon");

    });


    $(".toggle-units").click(function () {
        var far = "F\xB0",
            cel = "C\xB0";
        var toFar = false;
        if ($(this).text() == far) {
            toFar = true;
        } else {
            toFar = false;
        }

        $(this).text(($(this).text() == far) ? cel : far);

        var units = $('.info-container header+p span:first-of-type');
        var symbol = $('.units');

        for (var i = 0; i < units.length; i++) {
            var unit = Number($(units[i]).text());

            if (toFar) {
                $(units[i]).text(Math.round((unit * 1.8) + 32));
                $(symbol[i]).text('F');
            } else {
                $(units[i]).text(Math.round((unit - 32) / 1.8));
                $(symbol[i]).text('C');
            }
        }

    });
    // });