
document.getElementById("startDate").value = "2021-01-01";
document.getElementById("endDate").value = "2021-01-30";

// Create API URL and return it.
function createURL() {

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

    // End date gets extra 3600 seconds to ensure that we get the datapoint for the last day also.
    let endDateUnix = getUnixDate(endDate.value) + 3600;

    // Return apiURL
    let apiURL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=" +
    startDateUnix + "&to=" + endDateUnix;

    return apiURL;
}

// responseObject to hold data from API
let responseObject = {};

// Get data from API using XMLHttpRequest.
function getData() {

    // API URL with desired interval.
    let apiURL = createURL();

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

// Correct price datapoint(closest to midnight) for each day.
function getValidPriceDatapoints() {

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

    let dpObj = getValidPriceDatapoints();
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

    // Get the longest downward trend.
    let dwObj = dwTrend()

    let dwDates = dwObj.dwDateArr;
    let dwPrices = dwObj.dwPriceArr;

    // dwEndDate index (works with price also):
    let j = dwDates.length - 1;

    // Datapoints are in some cases from 0:00 UTC, so we might need to
    // refer to start date as start date-1 and end date as end date-1.
    let dwStartDate = dwDates[0];
    let dwEndDate = dwDates[j];
    let correctStartDate = new Date(dwStartDate);
    let correctEndDate = new Date(dwEndDate);

    correctStartDate.setDate(correctStartDate.getDate() -1);
    correctEndDate.setDate(correctEndDate.getDate() -1);

    // dwDates to more-easy-to-read format.
    if (dwStartDate.getUTCHours === 0) {

        dwStartDate = correctStartDate.toISOString().substring(0, 10);
    } else {

        dwStartDate = dwStartDate.toISOString().substring(0, 10);
    }

    if (dwEndDate.getUTCHours === 0) {

        dwEndDate = correctEndDate.toISOString().substring(0, 10);
    } else {

        dwEndDate = dwEndDate.toISOString().substring(0, 10);
    }

    // Prices of the first and last day rounded to 2 decimals.
    let dwFirstPrice = dwPrices[0].toFixed(2);
    let dwLastPrice = dwPrices[j].toFixed(2);
    let valueDrop = (dwPrices[0]-dwPrices[j]).toFixed(2);

    let dwPrint = "";

    dwPrint += "<br>";
    dwPrint += "The longest downward trend of bitcoin:"
    dwPrint += "<br><br>";
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
    dwPrint += "<br>";

    return dwPrint;
}

// The responseObject holds the data received from API
// in following categories: responseObject.prices Array (2) [UNIXTIMESTAMP, BITCOINPRICE]
//                          responseObject.market_caps Array (2) [UNIXTIMESTAMP, MARKET_CAPS]
//                          responseObject.total_volumes Array (2) [UNIXTIMESTAMP, TOTAL_VOLUMES]

// Correct total_volumes datapoint(closest to midnight) for each day.
function getValidVolumeDatapoints() {

    let obj = responseObject.total_volumes;
    let dateArr = [];
    let volumeArr = [];

    for (let i = 0; i < obj.length; i++) {

        let volume = obj[i][1];
        let date = new Date(obj[i][0]);

        // Last datapoint is the correct datapoint for last day.
        if (i === (obj.length -1)) {
            dateArr.push(date);
            volumeArr.push(volume);
        } else if ((i+1) <= (obj.length -1)) {

            let dateNext = new Date(obj[i+1][0]);

            // If current date is different than nextDate,
            // current date is correct datapoint (closest to midnight)
            if (date.getUTCDay() !== dateNext.getUTCDay()) {
                dateArr.push(date);
                volumeArr.push(volume);
            }
        }
    }
    // dpObj holds the dates and prices of valid datapoints.
    let dpObj = {dateArr, volumeArr};

    console.log(dpObj);

    // Returns the object with correct datapoints.
    return dpObj;
}

// Which date has the biggest trading volume in €.
function highestVolume() {

    let dpObj = getValidVolumeDatapoints();

    let dateArr = dpObj.dateArr;
    let volumeArr = dpObj.volumeArr;

    // highestVolume array, index 0 = date, index 1 = volume (in €).
    let hvArr = [];

    for (let i = 0; i < dateArr.length; i++) {

        let date  = dateArr[i];
        let volume = volumeArr[i];

        // Store first date and trading volume to the highestVolume array
        if (i === 0) {

            hvArr.push(date);
            hvArr.push(volume);
        } else {

            // If current loop's volume is bigger, replace
            if (volume > hvArr[1]) {

                hvArr = [];
                hvArr.push(date);
                hvArr.push(volume);
            }
        }
    }

    return hvArr;
}

// Returns the date and highest trading volume of that date as a string.
function hvResults() {

    // Get the date when the highest volume of trading occurred and the volume.
    let hvArr = highestVolume();

    // Datapoints are in some cases from 0:00 UTC, so we might need to
    // refer to date as date -1.
    let date = hvArr[0];
    let correctDate = new Date(date);

    correctDate.setDate(correctDate.getDate() -1);

    if (date.getUTCHours() === 0) {

        date = correctDate.toISOString().substring(0, 10);
    } else {

        date = date.toISOString().substring(0, 10);
    }

    // Total trading volume rounded to 2 decimals.
    let volume = hvArr[1].toFixed(2);

    let hvPrint = "";

    hvPrint += "<br>";
    hvPrint += "The highest trading volume (in €) of bitcoin:"
    hvPrint += "<br><br>";
    hvPrint += "The date: <b>" + date + "</b>";
    hvPrint += "<br>";
    hvPrint += "Total trading volume (€): <b>" + volume + " €</b>";
    hvPrint += "<br>";

    return hvPrint;
}

// Time machine exploit: In which day should one purchase bitcoins,
// and in which day should one sell bitcoins during the interval
// for maximized profit?
function tmExploit() {

    let resultsDiv = document.getElementById("resultsDiv");

    let dpObj = getValidPriceDatapoints();

    let dateArr = dpObj.dateArr;
    let priceArr = dpObj.priceArr;

    let buyDateIndex = 0;
    let sellDateIndex = 0;
    let bestProfit = 0;

    for (let i = 0; i < dateArr.length; i++) {

        // We check one price / date at a time.
        let price = priceArr[i];

        if (dateArr[i+1] !== undefined) {

            // j starts as i +1, because we are interested in future points only.
            for (let j = i + 1; j < dateArr.length; j++) {

                let comparablePrice = priceArr[j];

                // Erasing comparablePrice(price next day) from price,
                // and multiplying by -1 to show profit as a positive number.
                let profit = (price - comparablePrice) * -1;

                if (profit > bestProfit) {
                    bestProfit = profit;
                    buyDateIndex = i;
                    sellDateIndex = j;
                }
            }
        }
    }

    if (buyDateIndex === 0 && sellDateIndex === 0 && bestProfit === 0) {
        resultsDiv.innerHTML += "<br>For the given time interval, there is no use for time machine exploit,<br>" +
        "because there is no opportunity for profiting.<br>"
    }

    // Get buyDate and sellDate from dateArr based on correct indexes.
    let buyDate = dateArr[buyDateIndex];
    let sellDate = dateArr[sellDateIndex];

    // exploitArr holds the buyDate(0), sellDate(1), and profit(2).
    let exploitArr = [buyDate, sellDate, bestProfit];

    console.log(exploitArr);

    return exploitArr;
}

// Transforms string to date.
function transformToDate(dateString) {

    let dateArray = dateString.split("-");

    // We want to make sure that we use UTC time, because Coingecko API does.
    let date = new Date(Date.UTC(dateArray[0], (dateArray[1] - 1),
    dateArray[2], '23', '00', '00'));

    return date;
}

// Setting event listener to the "Get results" -button.
document.getElementById("submitBtn").addEventListener("click", function () {

    let startDateDefault = document.getElementById("startDate").defaultValue;
    let endDateDefault = document.getElementById("startDate").defaultValue;
    let endDateValue = document.getElementById("endDate").value;
    let startDateValue = document.getElementById("startDate").value;
    let startDate = transformToDate(startDateValue);
    let endDate = transformToDate(endDateValue);
    let resultsDiv = document.getElementById("resultsDiv");

    // Empty resultsDiv before new results are shown:
    resultsDiv.innerHTML = "";

    if (startDate >= endDate) {
        resultsDiv.innerHTML = "Start date must be before end date!";
        return;
    } else if (startDateValue === startDateDefault || endDateValue === endDateDefault) {
        resultsDiv.innerHTML = "Start date and end date must be picked!";
        return;
    }

    // Get API data
    getData();

    let dwTrend = document.getElementById("downwardTrend");
    let htVolume = document.getElementById("highestTradingVolume");

    // Wait 300 ms and then check search options
    setTimeout(searchOptions, 300);

    function searchOptions() {

        resultsDiv.innerHTML += "Time interval: <b>" + startDateValue + "</b> - <b>" + endDateValue + "</b><br>"

        if (dwTrend.checked === true) {

            let dwResult = dwResults();
            resultsDiv.innerHTML += dwResult;
        }

        if (htVolume.checked === true) {
            let hvResult = hvResults();
            resultsDiv.innerHTML += hvResult;
        }
    }
});
