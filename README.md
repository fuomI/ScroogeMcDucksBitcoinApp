# Scrooge McDuck's Bitcoin Application

## Project description

This is a JavaScript application that I made for 
the Vincit's pre assignment: https://vincit.fi/risingstar/Vincit-Rising-Star-2021-Pre-assignment.pdf

## Requirements

### Get historical bitcoin data from API provided by Coingecko
- Give the user datepickers for the desired time interval
- Create correct API url depending on dates picked
- Get data from API 
- Process the data so that datapoints closest to midnight (UTC) are used

### Create three functionalities that use the data from API

#### The longest downward trend
Based on the time interval the function finds out the longest downward trend
during that time period and shows some appropriate data regarding the trend.

#### The highest trading volume
Based on the time interval function tells which day had the highest trading 
volume in €.

#### Time machine exploit
Hindsight is 20/20, but if it was possible to go back in time, in which day
should one buy bitcoins and in which day should one sell said bitcoins for
maximized profit?

## Application logic
1. Get bitcoin data from API (Coingecko) using getData() -function
2. Get valid datapoints using either getValidPriceDatapoints() or getValidVolumeDatapoints()
3. Process valid datapoints using functions depending on user choices:
	- **dwTrend()** (downwardTrend) 
	- **highestVolume()** (highest trading volume)
	- **tmExploit()** (time machine exploit)
4. Present the results using functions depending on user choices:
	- **dwResults()** (Results of the longest downward trend)
	- **hvResults()** (Results of the highest trading volume)
	- **tmeResults()** (Results of the time machine exploit)
5. Behind **"Get Results" -button** is a function that controls the outcome
   depending on user choices.

## Languages

- JavaScript (vanilla)
- "HTML"
- "CSS"

## Tools used

- Visual Studio Code (IDE)
- Google Chrome developer tools


## How to run?
 
Application is published on Netlify: https://romantic-aryabhata-2fdeca.netlify.app