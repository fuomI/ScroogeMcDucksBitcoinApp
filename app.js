// Let's give startDate and endDate some values right at start
// to make our testing process faster.
let startDate = document.getElementById("startDate");
startDate.value = '2020-01-01';

let endDate = document.getElementById("endDate");
endDate.value = '2020-01-30';

// responseObject to hold JSON data from API.
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

    // End date gets extra 3600 seconds, to get datapoints close to midnight.
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
            console.log(responseObject);
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
    let dpObj = {dateArr, priceArr};

    // Returns the object with correct datapoints.
    return dpObj;
}

// Checking the date and price of valid datapoints.
function datapointTest() {

    let dpObj = getValidDatapoints();
    let dateArr = dpObj.dateArr;
    let priceArr = dpObj.priceArr;

    for (let i = 0; i < dateArr.length; i++) {

        let date = dateArr[i];
        let value = priceArr[i];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint price
        console.log("Price: " + value);
    }
}

// Longest downward trend is most consecutive days of price going down.
function dwTrend() {

    let dpArr = getValidDatapoints();
    let obj = responseObject.prices;

    let dwArr = [];
    let arr = [];

    for (let i = 1; i < dpArr.length; i++) {

        let j = dpArr[i];

        let price = obj[j][1];
        let priceYd = obj[j-1][1];

        if (price > priceYd && arr.length > dwArr.length) {
            console.log (price + " is bigger than " + priceYd);
            dwArr = arr;
            arr = [];
        } else if (price > priceYd) {
            console.log (price + " is bigger than " + priceYd);
            arr = [];
        } else {
            console.log (price + " is smaller than " + priceYd);
            arr.push(j);
            console.log(arr);
        }
    }
    return dwArr;
}

// Checking the date and price of datapoints in longest downward trend.
function datapointTestDW() {

    let dpArr = dwTrend();
    let origObj = responseObject.prices;

    for (let i = 0; i < dpArr.length; i++) {

        let j = dpArr[i];
        let date = new Date(origObj[j][0]);
        let value = origObj[j][1];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint price
        console.log("Price: " + value);
    }
}
    /* Presenting the data:
    let dwIndexLength = dwIndexesLongest.length;
    let dwStartDate = new Date(obj.prices[dwIndexesLongest[0]][0]);
    let dwEndDate = new Date(obj.prices[dwIndexesLongest[dwIndexLength-1]][0]);

    console.log(dwStartDate);
    console.log(dwEndDate);

    let dwStart = dwStartDate.toISOString().substring(0, 10);

    let dwEnd = dwEndDate.toISOString().substring(0, 10);

    longestDWTrend += "<p> The longest downward trend of bitcoin";
    longestDWTrend += " from " + startDateValue + " to " + endDateValue + " "
    longestDWTrend += "was <b>" + dwDaysLongest + "</b> days ";
    longestDWTrend += "during the time between " + dwStart + " and " + dwEnd + "</p>";

    return longestDWTrend; */


// Setting event listener
document.getElementById("submitBtn").addEventListener("click", function () {

    console.log("hello world");

    let result = "";

    let dwTrend = document.getElementById("downwardTrend");

    if (dwTrend.checked == true) {
        result += longestDownwardTrend(responseObject);
    }

    document.getElementById("resultsDiv").innerHTML = result;
});

