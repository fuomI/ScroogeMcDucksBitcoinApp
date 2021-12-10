// These functions are the same functions that I have in
// app.js but these include console.log() functions
// for debugging.

/* This test function checks if we can read date inputs,
// if we can change the data to unixtimestamps,
// if we can make appropriate apiURL.
function testFunctionOne() {

    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate").value;

    console.log(startDateValue);
    console.log(endDateValue);

    let startDateUnix = getUnixDate(startDateValue);
    let endDateUnix = getUnixDate(endDateValue);

    console.log(startDateUnix);
    console.log(endDateUnix);

    let apiURL = getURL(startDateUnix, endDateUnix);

    console.log(apiURL);
}

// Variables to hold all the data from API.
let  prices = [], marketCaps = [],
totalVolumes = [], dataObject = {};

// Inside this function we can use the fetched data.
let useData = function() {
    for (let prop in dataObject) {

        console.log()
        console.log(dataObject[prop][0]);

        let priceArray = [];
        let priceDateArray = [];

        for (let i = 0; i < dataObject[prop][0]; i++) {

        }
    }
}

// Fetches the data from API and
// saves it to the variables.
fetch(getURL(startDateUnix, endDateUnix))
    .then(function(resp) {
        return resp.json();
    })
    .then(function(data) {
        prices = data.prices;
        marketCaps = data.market_caps;
        totalVolumes = data.total_volumes;
        dataObject = data;
        useData();
    });


// We need a function to find out the correct data point
// for each day in the range.
function getCorrectDataPoint(responseObject) {

    let dataPointArray = [];
    let correctDataPoint = 0;

    for (let i = 0; i < responseObject.prices.length; i++) {

        let properDate = new Date(responseObject.prices[i][0]);
        // console.log(properDate);

        if (responseObject.prices[i+1] != undefined) {

            let properNextDate = new Date(responseObject.prices[i+1][0]);
            //console.log(properNextDate.getDay());
            //console.log(properDate.getDay());

            // The last data point is the closest to midnight and
            // thus it is the correct data point. If the next date
            // is still the same day, we get to the last data point
            // of the day eventually.
            if (properDate.getUTCDay() == properNextDate.getUTCDay()) {

                correctDataPoint = i+1;
            } else {
                console.log("hello");
                dataPointArray.push(correctDataPoint);
            }
        } else {
            console.log("world");
            correctDataPoint = i;
            dataPointArray.push(correctDataPoint);
        }
    }

    let dateOne = new Date(responseObject.prices[dataPointArray[0]][0]);
    let dateTwo = new Date(responseObject.prices[dataPointArray[1]][0]);
    let dateThree = new Date(responseObject.prices[dataPointArray[2]][0]);
    let dateFour = new Date(responseObject.prices[dataPointArray[3]][0]);

    console.log(dataPointArray);
    console.log(dateOne);
    console.log(dateTwo);
    console.log(dateThree);
    console.log(dateFour);
    return dataPointArray;
}

// function gets data from the API, and
// processes the data, and presents it.
function getDataAndProcess() {

    // We need to change normal dates to
    // UNIXTIMESTAMPS, because the API
    // uses UNIXTIMESTAMPS.
    let startDateUnix = getUnixDate(startDateValue);

    // For endDate we add 3600 seconds to ensure
    // that we get enough datapoints for the enddate.
    let endDateUnix = getUnixDate(endDateValue) + 3600;

    // Correct url is made with help function getURL(startDateUnix, endDateUnix)
    let apiURL = getURL(startDateUnix, endDateUnix);

    // We are doing XMLHttpRequest (GET) to the API.
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", apiURL, true);
    xmlhttp.send();

    // If the request is completed and status is OK
    // we can start manipulating data.
    xmlhttp.onreadystatechange=function() {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            // We make responseObject with JSON.parse
            // so that we can easily access the data.
            let responseObject = JSON.parse(xmlhttp.responseText);


            // getCorrectDataPoint(responseObject);

            // longestDownwardTrend(responseObject);


            console.log(responseObject);
            console.log(responseObject.prices[0]);
            console.log(responseObject.market_caps[0]);
            console.log(responseObject.total_volumes[0]);
            console.log(responseObject.prices[0][0]);
            console.log(responseObject.prices[0][1]);


            let dateArray = [];

            for (let i = 0; i < responseObject.prices.length; i++) {

                let unixDate = responseObject.prices[i][0];
                let properDate = new Date(unixDate);
                console.log(unixDate);
                console.log(properDate);

                let isoDate = properDate.toISOString().substring(0, 10);
                console.log(isoDate);

                dateArray.push(properDate);
            }

           // console.log(dateArray);
        }
    }
}

// We need a function that changes strings to dates, and dates to UNIXTIMESTAMPS.
// We need to split the format used in "input date", so that
// we can make a date object, which we can then format into UNIXTIMESTAMP.
// We use time 23:00:00 (close to midnight), when creating the date object.
function getUnixDate(dateString) {

    // console.log(dateString);

    let dateArray = dateString.split("-");
    // console.log(dateArray);

    // We want to make sure that we use UTC time.
    let properDate = new Date(Date.UTC(dateArray[0], (dateArray[1] - 1),
    dateArray[2], '23', '00', '00'));
    // console.log(properDate);


    let unixFormDate = Math.round(properDate.getTime()/1000);
    // console.log(unixFormDate);

    return unixFormDate;
}

function dataPointTest() {

    let dataPointArray = getCorrectDataPoint(responseObject);

    console.log(dataPointArray);

    function testFunction(value) {
        let testDate = new Date(responseObject.prices[value][0]);
        console.log(testDate);
    }

    dataPointArray.forEach(testFunction);
}

    // We need to track the indexes of the dates
    // involved in the longest downward trend.
    let dateIndexes = [];
    let dateIndexesLongest = [];

    // We need to track the total number of days
    // in a downward trend.
    let sumOfDays = 0;
    let sumOfDaysLongest = 0;

    // for-loop lets us to iterate through the prices Arrays
    // inside the responseObject.
    for (let i = 0; i < responseObject.prices.length; i++) {

        // responseObject.prices[i][1] is the price where as
        // responseObject.prices[i][0] would be the date.
        if (responseObject.prices[i][1] > responseObject.prices[i+1][1]) {

            sumOfDays += 1;
        }

        if (responseObject.prices[i][1] < responseObject.prices[i+1][1] &&
            sumOfDays > sumOfDaysLongest) {


        }
    }


    FOR TESTING PURPOSES ONLY!!!!

    for (let i = 0; i < dwIndexesLongest.length; i++) {
        console.log(obj.prices[dwIndexesLongest[i]][1]);

        let testDate = new Date(obj.prices[dwIndexesLongest[i]][0]);

        console.log(testDate);
    }

    console.log(dwDaysLongest);
    console.log(dwIndexesLongest);


*/