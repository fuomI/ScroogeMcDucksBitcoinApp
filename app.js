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
        let properDate = new Date(Date.UTC(dateArray[0], (dateArray[1] - 1),
        dateArray[2], '23', '00', '00'));

        // Date to UNIXTIMESTAMP
        let unixDate = Math.round(properDate.getTime()/1000);

        return unixDate;
    }

    // Start date to UNIXTIMESTAMP Start date.
    let startDateUnix = getUnixDate(startDate.value);

    // End date gets extra 3600 seconds, to get datapoints closest to midnight.
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
// in following form: responseObject.prices Array (2) [UNIXTIMESTAMP, BITCOINPRICE]
//                    responseObject.market_caps Array (2) [UNIXTIMESTAMP, MARKET_CAPS]
//                    responseObject.total_volumes Array (2) [UNIXTIMESTAMP, TOTAL_VOLUMES]

// Correct datapoint(closest to midnight) for each day.
function getCorrectDatapoint(responseObject) {

    let datapointArray = [];
    let correctDatapoint = 0;

    for (let i = 0; i < responseObject.prices.length; i++) {

        let thisDate = new Date(responseObject.prices[i][0]);

        if (responseObject.prices[i+1] != undefined) {

            let nextDate = new Date(responseObject.prices[i+1][0]);

            // The last data point is the closest to midnight and
            // thus it is the correct data point. If the next date
            // is still the same day, we get to the last data point
            // of the day eventually. We want UTC time.
            if (thisDate.getUTCDay() === nextDate.getUTCDay() &&
            thisDate.getUTCMonth() === nextDate.getUTCMonth() &&
            thisDate.getUTCFullYear() === nextDate.getUTCFullYear()) {

                correctDatapoint = i+1;
            } else {

                datapointArray.push(correctDatapoint);
            }
        } else {
            correctDatapoint = i;
            datapointArray.push(correctDatapoint);
        }
    }

    return datapointArray;
}

// Testing the dataPointArray[]

function datapointTest() {

    let datapointArray = getCorrectDatapoint(responseObject);
    // console.log(datapointArray);

    datapointArray.forEach(showPriceData);

    function showPriceData(i) {

        let thisDate = new Date(responseObject.prices[i][0]);
        let thisPrice = responseObject.prices[i][1];
        console.log("Date: " + thisDate + " Price: " + thisPrice);
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

