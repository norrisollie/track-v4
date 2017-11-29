// scripts

// // change protocol to https if http
if (window.location.protocol != 'https:') {
    window.location.protocol = 'https';
}

function getPlatform(platform) {
    // remove null if platform is null
    if (platform === null) {
        return "<span class='platform unavailable'>Plat. n/a</span>";
    } else {
        return "<span class='platform'>Plat. " + platform + "</span>"
    }
}

// run when page has fully loaded
window.onload = function() {

    // check if geolocation is supported
    if ("geolocation in navigator") {

        // log to console
        console.log("GeoLocation is working");

        // run function to get users location
        navigator.geolocation.getCurrentPosition(function(position) {

            // get users latitude and longitude
            var lat = position.coords.latitude,
                lon = position.coords.longitude;

            // log to console
            // console.log("Coordinates: " + lat + "," + lon);

            // api keys and tokens
            var appID = "adeb06bb",
                appKey = "6132ab123fadaa1d87d459438a5f5c27",
                nrKey = "c8eebaa7-d421-4025-bb02-989cc9c53b39",
                nearestStationsUrl = "https://transportapi.com/v3/uk/train/stations/near.json?app_id=" + appID + "&app_key=" + appKey + "&lat=" + lat + "&lon=" + lon;

            // empty array for departure urls
            var departuresUrlArray = new Array();

            // request to find nearest stations
            var nearestStationsReq = new XMLHttpRequest();

            nearestStationsReq.open('GET', nearestStationsUrl, true);

            nearestStationsReq.onload = function() {

                if (this.status >= 200 && this.status < 400) {

                    // response data
                    var res = JSON.parse(this.response);

                    // variable for stations array in response
                    var data = res.stations;

                    // for loop to iterate through response data
                    for (var i = 0; i < data.length; i++) {

                        // get information from response data
                        var code = data[i].station_code;
                        var name = data[i].name;
                        var distanceMetres = data[i].distance;
                        var distanceKilometres = (distanceMetres / 1000).toFixed(1);
                        var distanceKilometres = distanceKilometres + "km";

                        // log data to console to reference
                        // console.log("Code: " + code + " | Name: " + name + " | Distance: " + distanceKilometres);

                        // generate urls for timetable data
                        var departuresUrl = "https://track-5.apphb.com/departures/" + code + "/100?accessToken=" + nrKey;

                        // push completed urls to array
                        departuresUrlArray.push(departuresUrl);

                        // declare resultsWindow element
                        var resultsWindow = document.querySelector(".results-window");

                        var stationTemplate =
                            "<div class='station-result'>" +
                            "<div class='station-name-container'>" +
                            "<span class='station-name'><img class='nr-logo' src='assets/images/nr.svg'>" + name + "</span>" +
                            "<div class='location-distance'>This station is <span class='distance'>" + distanceKilometres + "</span> away from your location</div></div>" +
                            "<div class='service-container' data-stationcode=" + code + ">" +
                            "</div>" +
                            "</div>";

                        // insert stationTemplate element in to resultsWindow element
                        // resultsWindow.innerHTML = "";
                        resultsWindow.innerHTML += stationTemplate;

                    }

                    // loop to go throught departuresUrlArray
                    for (var i = 0; i < departuresUrlArray.length; i++) {

                        // request for service info
                        var serviceReq = new XMLHttpRequest();

                        serviceReq.open('GET', departuresUrlArray[i], true);

                        serviceReq.onload = function() {

                            if (this.status >= 200 && this.status < 400) {

                                // response text
                                var res = JSON.parse(this.response);

                                // array with the required info
                                var data = res.trainServices;

                                // loop to go through each train service
                                for (var i = 0; i < data.length; i++) {

                                    // get information from api response text
                                    var destination = data[i].destination[0],
                                        destinationName = destination.locationName,
                                        destinationCode = destination.crs,
                                        origin = data[i].origin,
                                        originName = origin.locationName,
                                        originName = origin.crs,
                                        departureTime = data[i].std,
                                        departureTimeExpected = data[i].etd,
                                        platform = data[i].platform,
                                        operator = data[i].operator,
                                        serviceVia = destination.via,
                                        serviceID = data[i].serviceID,
                                        serviceIDUrlSafe = data[i].serviceIdUrlSafe,
                                        currentStationCode = res.crs;

                                    // remove null if service via is null
                                    if (serviceVia === null) {

                                        // replace with empty string
                                        var serviceViaTemplate = "<div class='service-row row-via'><span class='via via-null'></span></div>";

                                    } else if (serviceVia !== null) {

                                        var serviceViaTemplate = "<div class='service-row row-via'><span class='via'>" + serviceVia + "</span></div>";

                                    }

                                    // remove null if platform is null
                                    var platform = getPlatform(platform)

                                    

                                    // if statement to add specific classes depending on status
                                    if (departureTimeExpected === "On time") {

                                        var departureTime = "<div class='service-row row-time'><span class='time'>" + departureTime + "</span>";
                                        var status = "<span class='status ontime'>" + departureTimeExpected + "</span>";

                                    } else if (departureTimeExpected === "Delayed") {

                                        var departureTime = "<div class='service-row row-time'><span class='time strikethrough'>" + departureTime + "</span>";
                                        var status = "<span class='status delayed'>" + departureTimeExpected + "</span>";

                                    } else if (departureTimeExpected === "Cancelled") {

                                        var departureTime = "<div class='service-row row-time'><span class='time strikethrough'>" + departureTime + "</span>";
                                        var status = "<span class='status cancelled'>" + departureTimeExpected + "</span>";

                                    } else {
                                        var departureTime = "<div class='service-row row-time'><span class='time strikethrough'>" + departureTime + "</span>";
                                        var status = "<span class='status delayed'> Delayed " + departureTimeExpected + "</span>";
                                    }

                                    var serviceBoxTemplate =

                                        "<div class='service-box' data-currentcrs='" + currentStationCode + "' data-serviceid='" + serviceID + "''>" +
                                        departureTime +
                                        status +
                                        platform + "</span></div>" +
                                        "<div class='service-row row-destination'><span class='destination'>" + destinationName + "</span></div>" +
                                        serviceViaTemplate +
                                        "<div class='service-row row-operator'><span class='operator'>Operated by <span class='operator-name'>" + operator + "</span></span></div>" +
                                        "</div>";

                                    // declare serviceContainer element
                                    var serviceContainer = document.querySelectorAll(".service-container");

                                    // inserts correct service in to correct station element based on matching codes
                                    var currentWrapper = [...serviceContainer].find((wrapper) => wrapper.dataset.stationcode === currentStationCode);

                                    var serviceBoxFragment = document.createRange().createContextualFragment(serviceBoxTemplate);

                                    var serviceBoxFinding = document.querySelectorAll(".service-box-finding");

                                    currentWrapper.appendChild(serviceBoxFragment);
                                }

                                // declare serviceBox variable
                                var serviceBox = document.querySelectorAll(".service-box");

                                // loop through serviceBox elements
                                for (var i = 0; i < serviceBox.length; i++) {

                                    serviceBox[i].addEventListener("click", serviceBoxClick);

                                }

                            } else {
                                // We reached our target server, but it returned an error

                            }

                            var resultsWindow = document.querySelector(".results-window");
                            resultsWindow.classList.add("results-move");

                        };

                        serviceReq.onerror = function() {
                            // There was a connection error of some sort
                        };

                        serviceReq.send();

                    }

                } else {
                    // We reached our target server, but it returned an error
                }

            };

            nearestStationsReq.onerror = function() {
                // There was a connection error of some sort
            };

            nearestStationsReq.send();

        });

    } else {

        // log to console
        console.log("GeoLocation is not supported");

    }

    // declare serviceWindow element
    var serviceWindow = document.querySelector(".service-window");
    // declare serviceWindow element
    var serviceWindowContainer = document.querySelector(".service-window-container");
    // declare closeButton variable
    var closeButton = document.querySelector(".close-button");

    // add event listeners to respective elements
    serviceWindow.addEventListener("click", closeServiceWindow);
    // serviceWindowContainer.addEventListener("click", closeServiceWindow);
    closeButton.addEventListener("click", closeServiceWindow);

    // function to run to hide serviceWindow element
    function closeServiceWindow(e) {

        // declare target
        var target = e.target;

        // var theBody = document.querySelector("body")
        // theBody.classList.remove("body-no-scroll");

        // if target is closeButton or serviceWindow
        if (target === closeButton || target === serviceWindow) {

            // add/remove classes of respective elements
            serviceWindow.classList.add("hidden");
            serviceWindow.classList.remove("active");
            serviceWindowContainer.classList.add("hidden");
            serviceWindowContainer.classList.remove("active");
        }
    }

    // function to run when service box has been clicked
    function serviceBoxClick(e) {

        // get target dataset
        var targetDataset = e.currentTarget.dataset.serviceid,
            target = e.target,
            // nr key
            nrKey = "c8eebaa7-d421-4025-bb02-989cc9c53b39";

        // log to console
        console.log(target)

        // generate url for service request
        var serviceInfoUrl = "https://track-5.apphb.com/service/" + targetDataset + "?accessToken=" + nrKey;

        console.log(serviceInfoUrl);

        // request to get service information
        var serviceInfoReq = new XMLHttpRequest();
        serviceInfoReq.open('GET', serviceInfoUrl, true);

        serviceInfoReq.onload = function() {
            if (this.status >= 200 && this.status < 400) {

                // declare response text variable
                var res = JSON.parse(this.response);

                // variable to enter the previousCallingPoints object
                var previousCallingPoints = res.previousCallingPoints;

                // new array to contain all the calling points for each service
                var callingPointsArray = new Array();

                // check to see whether previousCallingPoints object exists
                // if previousCallingPoints does not exist
                if (previousCallingPoints === null) {

                    // create an empty string
                    var previousCallingPoints = "";

                    // if previousCallingPoints object exists
                } else if (previousCallingPoints !== null) {

                    // variable to enter the previousCallingPoints object and array
                    var previousCallingPoints = previousCallingPoints[0].callingPoint;

                }

                // variable to enter the subsequentCallingPoints object
                var subsequentCallingPoints = res.subsequentCallingPoints[0].callingPoint;

                var destinationStation = res.subsequentCallingPoints[0].callingPoint.slice(-1)[0];
                var destinationStationCode = destinationStation.crs;
                var destinationStationName = destinationStation.locationName;

                // loop through the previousCallingPoints object
                for (var i = 0; i < previousCallingPoints.length; i++) {

                    console.log(previousCallingPoints[i])

                    // get the station name and code, as well as depart time, estimated depart time and actual depart time
                    var previousCallingPointStationName = previousCallingPoints[i].locationName,
                        previousCallingPointStationCode = previousCallingPoints[i].crs,
                        previousCallingPointStationScheduledDepartTime = previousCallingPoints[i].st,
                        previousCallingPointStationEstimatedDepartTime = previousCallingPoints[i].et,
                        previousCallingPointStationActualDepartTime = previousCallingPoints[i].at;

                    // if object is equal to null
                    if (previousCallingPointStationEstimatedDepartTime === null) {

                        // switch variable to other object
                        var previousCallingPointStationDepartStatus = previousCallingPointStationActualDepartTime;

                        // if object is equal to null
                    } else if (previousCallingPointStationActualDepartTime === null) {

                        // switch variable to other object
                        var previousCallingPointStationDepartStatus = previousCallingPointStationEstimatedDepartTime;

                    }

                    // if statement to add certain class depending on whether status is on time, delayed or cancelled
                    // if either variable values are equal to "ontime"
                    if (previousCallingPointStationEstimatedDepartTime === "On time" || previousCallingPointStationActualDepartTime === "On time") {

                        // template for status and depart time
                        var previousCallingPointStationDepartStatusTemplate = "<span class='depart-time'>" + previousCallingPointStationScheduledDepartTime + "</span><span class='expected-departure ontime'>" + previousCallingPointStationDepartStatus + "</span></span>";

                    } else if (previousCallingPointStationEstimatedDepartTime !== "On time" && previousCallingPointStationEstimatedDepartTime !== "Cancelled") {

                        // template for status and depart time
                        var previousCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + previousCallingPointStationScheduledDepartTime + "</span><span class='expected-departure delayed'>" + previousCallingPointStationDepartStatus + "</span></span>";

                    } else if (previousCallingPointStationEstimatedDepartTime === "Cancelled") {

                        // template for status and depart time
                        var previousCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + previousCallingPointStationScheduledDepartTime + "</span><span class='expected-departure cancelled'> " + previousCallingPointStationDepartStatus + "</span></span>";

                    }

                    // template for each calling point
                    var previousCallingPointStationTemplate =
                        "<span class='calling-point'>" + previousCallingPointStationName + "</span>" +
                        "<span class='calling-point-info'>" + previousCallingPointStationDepartStatusTemplate;

                    // push each calling point template in to an array
                    callingPointsArray.push(previousCallingPointStationTemplate);

                }

                // current station calling point
                // variables for required information
                var currentCallingPointStationName = res.locationName,
                    currentCallingPointStationCode = res.crs,
                    currentCallingPointStationPlatform = res.platform,
                    currentCallingPointStationScheduledDepartTime = res.std,
                    currentCallingPointStationEstimatedDepartTime = res.etd,
                    currentCallingPointStationActualDepartTime = res.atd,
                    currentCallingPointStationIsServiceCancelled = res.isCancelled,
                    currentCallingPointStationServiceDelayReason = res.delayReason,
                    currentCallingPointStationServiceCancelledReason = res.cancelReason;

                // serviceInfo element
                var serviceInfo = document.querySelector(".service-info");

                // if statement to check if service is delayed, cancelled or running on time
                // if there is no delay reason, the service is not cancelled but it is not estimated to be on time
                if (currentCallingPointStationServiceDelayReason === null && currentCallingPointStationIsServiceCancelled === false && currentCallingPointStationEstimatedDepartTime !== "On time") {

                    // insert delay reason in to element
                    serviceInfo.innerHTML = "This service is running with delays";

                    // if there is a delay reason but the service is not cancelled
                } else if (currentCallingPointStationServiceDelayReason !== null && currentCallingPointStationIsServiceCancelled === false) {

                    // insert delay reason in to element
                    serviceInfo.innerHTML = currentCallingPointStationServiceDelayReason;

                    // if estimated depart time equals on time
                } else if (currentCallingPointStationEstimatedDepartTime === "On time") {

                    // insert reason in to element
                    serviceInfo.innerHTML = "This service is running to schedule";

                    // if service has been cancelled
                } else if (currentCallingPointStationIsServiceCancelled === true) {

                    // insert delay reason in to element
                    serviceInfo.innerHTML = currentCallingPointStationServiceCancelledReason;

                    // if service has been cancelled but there is no reason
                } else if (currentCallingPointStationIsServiceCancelled === true && currentCallingPointStationServiceCancelledReason === null) {

                    // insert reason for delay in service info container
                    serviceInfo.innerHTML = "This service has been cancelled";

                }

                // if object is equal to null
                if (currentCallingPointStationEstimatedDepartTime === "null") {

                    // switch variable to other object
                    var currentCallingPointStationDepartStatus = previousCallingPointStationActualDepartTime;

                    // if object is equal to null
                } else if (currentCallingPointStationActualDepartTime === null) {

                    // switch variable to other object
                    var currentCallingPointStationDepartStatus = currentCallingPointStationEstimatedDepartTime;

                }

                // if statement to add certain class depending on whether status is on time, delayed or cancelled
                // if either variable values are equal to "ontime"
                if (currentCallingPointStationEstimatedDepartTime === "On time" || currentCallingPointStationActualDepartTime === "On time") {

                    // template for status and depart time
                    var currentCallingPointStationDepartStatusTemplate = "<span class='depart-time'>" + currentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure ontime'> " + currentCallingPointStationDepartStatus + "</span></span>";

                } else if (currentCallingPointStationEstimatedDepartTime !== "On time" && currentCallingPointStationEstimatedDepartTime !== "Cancelled") {

                    // template for status and depart time
                    var currentCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + currentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure delayed'> " + currentCallingPointStationDepartStatus + "</span></span>";

                } else if (currentCallingPointStationEstimatedDepartTime === "Cancelled") {

                    // template for status and depart time
                    var currentCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + currentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure cancelled'> " + currentCallingPointStationDepartStatus + "</span></span>";

                }


                // template for each calling point
                var currentCallingPointStationTemplate =
                    "<span class='calling-point'>" + currentCallingPointStationName + "</span>" +
                    "<span class='calling-point-info'>" + currentCallingPointStationDepartStatusTemplate;

                // push each calling point template in to an array
                callingPointsArray.push(currentCallingPointStationTemplate);

                // loop through the subsequentCallingPoints object
                for (var i = 0; i < subsequentCallingPoints.length; i++) {

                    // get the station name and code, as well as depart time, estimated depart time and actual depart time
                    var subsequentCallingPointStationName = subsequentCallingPoints[i].locationName,
                        subsequentCallingPointStationCode = subsequentCallingPoints[i].crs,
                        subsequentCallingPointStationScheduledDepartTime = subsequentCallingPoints[i].st,
                        subsequentCallingPointStationEstimatedDepartTime = subsequentCallingPoints[i].et,
                        subsequentCallingPointStationActualDepartTime = subsequentCallingPoints[i].at;

                    // if object is equal to null
                    if (subsequentCallingPointStationScheduledDepartTime === null) {

                        // switch variable to other object
                        var subsequentCallingPointStationDepartStatus = subsequentCallingPointStationActualDepartTime;

                        // if object is equal to null
                    } else if (subsequentCallingPointStationActualDepartTime === null) {

                        // switch variable to other object
                        var subsequentCallingPointStationDepartStatus = subsequentCallingPointStationEstimatedDepartTime;

                    }

                    // if statement to add certain class depending on whether status is on time, delayed or cancelled
                    // if either variable values are equal to "ontime"
                    if (subsequentCallingPointStationEstimatedDepartTime === "On time" || subsequentCallingPointStationActualDepartTime === "On time") {

                        // template for status and depart time
                        var subsequentCallingPointStationDepartStatusTemplate = "<span class='depart-time'>" + subsequentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure ontime'> " + subsequentCallingPointStationDepartStatus + "</span></span>";

                    } else if (subsequentCallingPointStationEstimatedDepartTime !== "On time" && subsequentCallingPointStationEstimatedDepartTime !== "Cancelled") {

                        // template for status and depart time
                        var subsequentCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + subsequentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure delayed'> " + subsequentCallingPointStationDepartStatus + "</span></span>";

                    } else if (subsequentCallingPointStationEstimatedDepartTime === "Cancelled") {

                        // template for status and depart time
                        var subsequentCallingPointStationDepartStatusTemplate = "<span class='depart-time strikethrough-small'>" + subsequentCallingPointStationScheduledDepartTime + "</span><span class='expected-departure cancelled'> " + subsequentCallingPointStationDepartStatus + "</span></span>";

                    }


                    // template for each calling point
                    var subsequentCallingPointStationTemplate =
                        "<span class='calling-point'>" + subsequentCallingPointStationName + "</span>" +
                        "<span class='calling-point-info'>" + subsequentCallingPointStationDepartStatusTemplate;

                    // push each calling point template in to an array
                    callingPointsArray.push(subsequentCallingPointStationTemplate);

                }









                // create variables for elements
                var currentStationElement = document.querySelector(".current-station");
                var destinationStationElement = document.querySelector(".destination-station");
                var currentStationFullElement = document.querySelector(".current-station-full");
                var destinationStationFullElement = document.querySelector(".destination-station-full");
                var callingPointsContainer = document.querySelector(".calling-points-container");


                currentStationElement.innerHTML = currentCallingPointStationCode;
                currentStationFullElement.innerHTML = currentCallingPointStationName;
                destinationStationElement.innerHTML = destinationStationCode;
                destinationStationFullElement.innerHTML = destinationStationName;
                callingPointsContainer.innerHTML = ""
                callingPointsContainer.innerHTML += callingPointsArray.join("");

                serviceWindow.classList.remove("hidden");
                serviceWindowContainer.classList.remove("hidden");


            } else {
                // We reached our target server, but it returned an error

            }
        };

        serviceInfoReq.onerror = function() {
            // There was a connection error of some sort
        };

        serviceInfoReq.send();
    }
}

// var request = new XMLHttpRequest();
// request.open('GET', '/my/url', true);

// request.onload = function() {
//   if (this.status >= 200 && this.status < 400) {
//     // Success!
//     var data = JSON.parse(this.response);
//   } else {
//     // We reached our target server, but it returned an error

//   }
// };

// request.onerror = function() {
//   // There was a connection error of some sort
// };

// request.send();



// // x