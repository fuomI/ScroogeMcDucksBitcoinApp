// Checking the date and price (in €) of valid price datapoints.
function datapointTest() {

    let dpObj = getValidPriceDatapoints();

    let dateArr = dpObj.dateArr;
    let priceArr = dpObj.priceArr;

    for (let i = 0; i < dateArr.length; i++) {

        let date = dateArr[i];
        let price = priceArr[i];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint trading volume
        console.log("Price: " + price);
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

// Checking the date and total_volume (in €) of valid volume datapoints.
function volumeDPtest() {

    let dpObj = getValidVolumeDatapoints();

    let dateArr = dpObj.dateArr;
    let volumeArr = dpObj.volumeArr;

    for (let i = 0; i < dateArr.length; i++) {

        let date = dateArr[i];
        let volume = volumeArr[i];

        // Datapoint date
        console.log("Date: " + date);

        // Datapoint trading volume
        console.log("Price: " + volume);
    }
}