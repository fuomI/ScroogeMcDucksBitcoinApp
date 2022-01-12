// Let's give startDate and endDate some values right at start
// to make our testing process faster.
let startDate = document.getElementById("startDate");
startDate.value = '2020-01-01';

let endDate = document.getElementById("endDate");
endDate.value = '2021-01-30';

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
function getCorrectDatapoints() {

    let arr = responseObject.prices;
    let dpArr = [];

    // first unixtimestamp: console.log(arr[0][0]);
    // first price: console.log(arr[0][1]);

    for (let i = 0; i < arr.length; i++) {

        let date = new Date(arr[i][0]);

        // Last datapoint is the correct datapoint for last day.
        if (i === (arr.length -1)) {

            dpArr.push(i);
            console.log("Added last datapoint: " + date);
        } else if ((i+1) <= (arr.length -1)) {

            let dateNext = new Date(arr[i+1][0]);

            // If current date is different than nextDate,
            // current date is correct datapoint (closest to midnight)
            if (date.getUTCDay() !== dateNext.getUTCDay()) {

                dpArr.push(i);
                console.log("Added datapoint: " + date);
            }
        }
    }
    // Returns the datapoint array with correct datapoints.
    return dpArr;
}

// Checking all datapoints.
function testAllDatapoints() {
    let allDP = responseObject.prices;

    for (let i = 0; i < allDP.length; i++) {

        let date = new Date(allDP[i][0]);
        console.log(date);
    }
}

// Testing the dpArr.
function datapointTest() {

    let dpArr = getCorrectDatapoints();
    let origArr = responseObject.prices;
    // console.log(datapointArray);

    for (let i = 0; i < dpArr.length; i++) {
        let j = dpArr[i];

        let date = new Date(origArr[j][0]);
        let value = origArr[j][1];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint price
        console.log("Price: " + value);
    }
}


// We need a function to find out,
// what is the longest downward trend in bitcoin's
// history. We use getCorrectDataPoints() function to
// get appropriate data point for each day.
function longestDownwardTrend(responseObject) {

    let obj = responseObject;

    // The String we want to return at the end
    let longestDWTrend = "";

    // We only want to go through indexes which are
    // known to be appropriate datapoints.
    let dataPoints = getCorrectDatapoint(obj);

    // Variable for tracking the consecutive days with
    // downward trend.
    let dwDays = 0;
    let dwDaysLongest = 0;

    // Arrays for tracking the indexes.
    let dwIndexes = [];
    let dwIndexesLongest = [];

    let j;

    for (let i = 0; i < dataPoints.length; i++) {

        // Variables for clarity.
        let currentIndex = dataPoints[i];
        let nextIndex = dataPoints[i+1];


        if (nextIndex != undefined && obj.prices[currentIndex][1] >
            obj.prices[nextIndex][1]) {

            dwDays += 1;
            dwIndexes.push(nextIndex);
        }

        else if (nextIndex != undefined && obj.prices[currentIndex][1] <
            obj.prices[nextIndex][1] && dwDays > dwDaysLongest) {

            dwDaysLongest = dwDays;
            dwIndexesLongest = dwIndexes;
            dwDays = 0;
            dwIndexes = [];
        }

    }

    // Presenting the data:
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

    return longestDWTrend;
}

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

