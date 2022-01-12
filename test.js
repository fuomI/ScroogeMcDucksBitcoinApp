// Checking all datapoints.
function testAllDataPoints() {
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