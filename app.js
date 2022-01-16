// Declaring the responseObject to hold API data.
let responseObject = {};

// Get data using datepicker's inputs.
function getData() {

    // Initializing startDate and endDate.
    let startDate = document.getElementById("startDate");

    let endDate = document.getElementById("endDate");

    // Strings to dates, dates to UNIXTIMESTAMPS.
    // We choose 23rd hour because we want datapoints closest to midnight.
    function getUnixDate(dateString) {

        let dateArray = dateString.split("-");

        // We want to make sure that we use UTC time, because Coingecko API does.
        let date = new Date(Date.UTC(dateArray[0], (dateArray[1] - 1),
        dateArray[2], '23', '00', '00'));

        // Date to UNIXTIMESTAMP
        let unixDate = Math.round(date.getTime()/1000);

        return unixDate;
    }

    // Start date to UNIXTIMESTAMP Start date.
    let startDateUnix = getUnixDate(startDate.value);

    // End date gets extra 3600 seconds to ensure that we get the datapoint for last day also.
    let endDateUnix = getUnixDate(endDate.value) + 3600;

    // Simple function that returns the API URL (Coingecko)
    function getURL(startDateUnix, endDateUnix) {

        let apiURL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=" +
        startDateUnix + "&to=" + endDateUnix;

        return apiURL;
    }

    // API URL with desired interval.
    let apiURL = getURL(startDateUnix, endDateUnix);

    // XMLHttpRequest (GET) to the API.
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", apiURL, true);
    xmlhttp.send();

    // If the request is completed and status is OK.
    xmlhttp.onreadystatechange=function() {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            // We use JSON.parse to change String to an object.
            responseObject = JSON.parse(xmlhttp.responseText);
        }
    }
}

// The responseObject holds the data received from API
// in following categories: responseObject.prices Array (2) [UNIXTIMESTAMP, BITCOINPRICE]
//                          responseObject.market_caps Array (2) [UNIXTIMESTAMP, MARKET_CAPS]
//                          responseObject.total_volumes Array (2) [UNIXTIMESTAMP, TOTAL_VOLUMES]

// Correct datapoint(closest to midnight) for each day.
function getValidDatapoints() {

    let obj = responseObject.prices;
    let dateArr = [];
    let priceArr = [];

    for (let i = 0; i < obj.length; i++) {

        let price = obj[i][1];
        let date = new Date(obj[i][0]);

        // Last datapoint is the correct datapoint for last day.
        if (i === (obj.length -1)) {
            dateArr.push(date);
            priceArr.push(price);
        } else if ((i+1) <= (obj.length -1)) {

            let dateNext = new Date(obj[i+1][0]);

            // If current date is different than nextDate,
            // current date is correct datapoint (closest to midnight)
            if (date.getUTCDay() !== dateNext.getUTCDay()) {
                dateArr.push(date);
                priceArr.push(price);
            }
        }
    }
    // dpObj holds the dates and prices of valid datapoints.
    let dpObj = {dateArr, priceArr};

    // Returns the object with correct datapoints.
    return dpObj;
}

// Longest downward trend is the most consecutive number of days in which price is going down.
function dwTrend() {

    let resultsDiv = document.getElementById("resultsDiv");

    let dpObj = getValidDatapoints();
    let dateArr = dpObj.dateArr;
    let priceArr = dpObj.priceArr;

    // Temporary array to hold indexes of the longest downward trend.
    let dwArr = [];
    // Temporary array for comparing stretches.
    let arr = [];
    // Array for prices in the longest downward trend.
    let dwPriceArr = [];
    // Array for dates in the longest downward trend.
    let dwDateArr = [];

    for (let i = 1; i < priceArr.length; i++) {

        let price = priceArr[i];
        let priceYd = priceArr[i-1];

        if (price > priceYd && arr.length > dwArr.length) {
            dwArr = arr;
            arr = [];
        } else if (price > priceYd) {
            arr = [];
        } else {
            arr.push(i);
        }
    }

    // If there is no downward trend, return.
    if (dwArr.length === 0) {
        resultsDiv.innerHTML = "There was no downward trend for the given time interval."
        return;
    }

    // Populating dwPriceArr[] and dwDateArr[].
    for (let i = 0; i < dwArr.length; i++) {

        let j = dwArr[i];

        dwPriceArr.push(priceArr[j]);
        dwDateArr.push(dateArr[j]);
    }

    // dwObj holds dates and prices of the longest downward trend.
    let dwObj = {dwDateArr, dwPriceArr};

    return dwObj;
}

// Process data and return the longest downward trend as a string.
function dwResults() {

    // Date input values.
    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate").value;

    // Get the longest downward trend.
    let dwObj = dwTrend()

    let dwDates = dwObj.dwDateArr;
    let dwPrices = dwObj.dwPriceArr;

    // dwEndDate index (works with price also):
    let j = dwDates.length - 1;

    // Datapoints are in some cases from 0:00 UTC, so we need to
    // refer to start date as start date-1 and end date as end date-1.
    let dwStartDate = dwDates[0];
    let dwEndDate = dwDates[j];
    let correctStartDate = new Date(dwStartDate);
    let correctEndDate = new Date(dwEndDate);
    correctStartDate.setDate(correctStartDate.getDate() -1);
    correctEndDate.setDate(correctEndDate.getDate() -1);

    // dwDates to more-easy-to-read format.
    dwStartDate = correctStartDate.toISOString().substring(0, 10);
    dwEndDate = correctEndDate.toISOString().substring(0, 10);

    // Prices of the first and last day rounded to 2 decimals.
    let dwFirstPrice = dwPrices[0].toFixed(2);
    let dwLastPrice = dwPrices[j].toFixed(2);
    let valueDrop = (dwPrices[0]-dwPrices[j]).toFixed(2);

    let dwPrint = "";

    dwPrint += "The longest downward trend of bitcoin:"
    dwPrint += "<br><br>";
    dwPrint += "Time interval: <b>" + startDateValue + "</b> - <b>" + endDateValue + "</b>";
    dwPrint += "<br>";
    dwPrint += "Length of the downward trend: <b>" + dwDates.length + "</b> day(s)";
    dwPrint += "<br>";
    dwPrint += "First day of the downward trend: <b>" + dwStartDate + "</b>";
    dwPrint += "<br>";
    dwPrint += "Last day of the downward trend: <b>" + dwEndDate + "</b>";
    dwPrint += "<br>";
    dwPrint += "Price of the first day: <b>" + dwFirstPrice + " €</b>";
    dwPrint += "<br>";
    dwPrint += "Price of the first day: <b>" + dwLastPrice + " €</b>";
    dwPrint += "<br>"
    dwPrint += "The drop in value: <b>" + valueDrop + " €</b>";

    return dwPrint;
}

// Transforms string to date.
function transformToDate(dateString) {

    let dateArray = dateString.split("-");

    // We want to make sure that we use UTC time, because Coingecko API does.
    let date = new Date(Date.UTC(dateArray[0], (dateArray[1] - 1),
    dateArray[2], '23', '00', '00'));

    return date;
}

// Setting event listener to the "get results" -button.
document.getElementById("submitBtn").addEventListener("click", function () {

    let startDateDefault = document.getElementById("startDate").defaultValue;
    let endDateDefault = document.getElementById("startDate").defaultValue;
    let endDateValue = document.getElementById("endDate").value;
    let startDateValue = document.getElementById("startDate").value;
    let startDate = transformToDate(startDateValue);
    let endDate = transformToDate(endDateValue);
    let resultsDiv = document.getElementById("resultsDiv");

    if (startDate >= endDate) {
        resultsDiv.innerHTML = "Start date must be before end date!";
        return;
    } else if (startDateValue === startDateDefault || endDateValue === endDateDefault) {
        resultsDiv.innerHTML = "Start date and end date must be picked!";
        return;
    }

    // Get data from API.
    getData();

    let dwResult = dwResults();
    let dwTrend = document.getElementById("downwardTrend");

    if (dwTrend.checked === true) {
        resultsDiv.innerHTML = dwResult;
    }
});
