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

// Checking the date and price of datapoints in longest downward trend.
function datapointTestDW() {

    let dwObj = dwTrend();
    let dwDateArr = dwObj.dwDateArr;
    let dwPriceArr = dwObj.dwPriceArr;

    for (let i = 0; i < dwDateArr.length; i++) {

        let date = dwDateArr[i];
        let value = dwPriceArr[i];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint price
        console.log("Price: " + value);
    }
}
