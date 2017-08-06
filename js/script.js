// scripts

// // change protocol to https if http
if (window.location.protocol != 'https:') {
    window.location.protocol = 'https';
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
                        resultsWindow.innerHTML += stationTemplate;

                    }

                    // log to console
                    // console.log(departuresUrlArray);

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
                                        var serviceVia = "";
                                    }

                                    // remove null if platform is null
                                    if (platform === null) {

                                        // replace with string
                                        var platform = "<span class='platform unavailable'>Plat. n/a</span>";

                                    } else if (platform !== null) {

                                        var platform = "<span class='platform'>Plat. " + platform + "</span>"

                                    }

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

                                    // log to console
                                    // console.log("Dest: " + destinationName + " " + serviceVia + " | Dep: " + departureTime + " | Status: " + departureTimeExpected + " | Platform: " + platform + " | Operator: " + operator);

                                    var serviceBoxTemplate =

                                        "<div class='service-box' data-currentcrs='" + currentStationCode + "' data-serviceid='" + serviceID + "''>" +
                                        departureTime +
                                        status +
                                        platform + "</span></div>" +
                                        "<div class='service-row row-destination'><span class='destination'>" + destinationName + "</span></div>" +
                                        "<div class='service-row row-via'><span class='via'>" + serviceVia + "</span></div>" +
                                        "<div class='service-row row-operator'><span class='operator'>Operated by <span class='operator-name'>" + operator + "</span></span></div>" +
                                        "</div>"

                                    // declare serviceContainer element
                                    var serviceContainer = document.querySelectorAll(".service-container");

                                    // serviceContainer[0].innerHTML += serviceBoxTemplate;

                                    // inserts correct service in to correct station element based on matching codes
                                    var currentWrapper = [...serviceContainer].find((wrapper) => wrapper.dataset.stationcode === currentStationCode);
                                    var serviceBoxFragment = document.createRange().createContextualFragment(serviceBoxTemplate);

                                    // add to correct element
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

        // var theBody = document.querySelector("body")
        // theBody.classList.add("body-no-scroll");

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

                // enter the previous calling points object
                var previousCallingPoints = res.previousCallingPoints;

                // if statement to check whether there are any previous calling points (for services that start at particular station-result)
                if (previousCallingPoints === null) {

                    // create an empty string
                    var previousCallingPoints = "";

                    // if previous calling points do exist (not null)
                } else if (previousCallingPoints !== null) {

                    // declare variable to enter object for previous calling points
                    var previousCallingPoints = res.previousCallingPoints[0].callingPoint;
                }

                // create variables for information in array
                var subsequentCallingPoints = res.subsequentCallingPoints[0].callingPoint;
                var destinationStation = res.subsequentCallingPoints[0].callingPoint.slice(-1)[0];
                var destinationStationCode = destinationStation.crs;
                var destinationStationName = destinationStation.locationName;

                // declare variables for required elements
                var currentStationElement = document.querySelector(".current-station");
                var destinationStationElement = document.querySelector(".destination-station");
                var currentStationFullElement = document.querySelector(".current-station-full");
                var destinationStationFullElement = document.querySelector(".destination-station-full");
                var callingPointsContainer = document.querySelector(".calling-points-container");

                // create new array to contain all calling point elements
                var callingPointsArr = new Array();

                //loop to go through calling points
                for (var i = 0; i < previousCallingPoints.length; i++) {

                    // 
                    var previousCallingPointsNames = previousCallingPoints[i].locationName;
                    var previousCallingPointsDepartTime = previousCallingPoints[i].st;
                    var previousCallingPointsEstimatedDepartTime = previousCallingPoints[i].et
                    var previousCallingPointsActualDepartTime = previousCallingPoints[i].at;

                    if (previousCallingPointsEstimatedDepartTime === null) {
                        var previousCallingPointsStatus = previousCallingPointsActualDepartTime;

                    } else if (previousCallingPointsActualDepartTime === null) {
                        var previousCallingPointsStatus = previousCallingPointsEstimatedDepartTime;
                    }

                    if(previousCallingPointsEstimatedDepartTime === "On time" || previousCallingPointsActualDepartTime === "On time") {

                        var previousDepartAndStatus = "<span class='depart-time'>" + previousCallingPointsDepartTime + "</span><span class='expected-departure ontime'> " + previousCallingPointsStatus +"</span></span>";
                    
                    } else if (previousCallingPointsDepartTime !== "On time") {
                        var previousDepartAndStatus = "<span class='depart-time strikethrough-small'>" + previousCallingPointsDepartTime + "</span><span class='expected-departure delayed'> " + previousCallingPointsStatus +"</span></span>";

                    }

                    var previousCallingPointElement = "<span class='calling-point'>" + previousCallingPointsNames + "</span>" +
                        "<span class='calling-point-info'>" + previousDepartAndStatus;

                    // push previous calling points in to array
                    callingPointsArr.push(previousCallingPointElement);
                }

                // variables for current station information
                var currentStationCode = res.crs;
                var currentStationName = res.locationName;
                var currentStationDepartTime = res.std;
                var currentStationEstimated = res.etd;
                var currentStationActualDepartTime = res.atd;
                var serviceCancelled = res.isCancelled;
                var delayReason = res.delayReason;
                var cancelReason = res.cancelReason;

                // declare service info element
                var serviceInfo = document.querySelector(".service-info");

                // check if service is cancelled
                if (serviceCancelled === false) {
                    console.log("not cancelled")
                } else if (serviceCancelled !== false) {
                    console.log("is cancelled");
                }

                // if there is no reason for delay, service is not cancelled and the depart time from station is not "On time"
                if (delayReason === null && serviceCancelled === false && currentStationEstimated !== "On time") {
                    
                    // insert reason why it is delayed
                    serviceInfo.innerHTML = "This service is running with delays";

                // if the delay reason object is not null and service is not cancelled
                } else if (delayReason !== null && serviceCancelled === false) {
                    
                    // insert reason for delay in service info container
                    serviceInfo.innerHTML = delayReason;

                // if the estimated depart time is "on time"
                } else if (currentStationEstimated === "On time") {

                    // insert reason for delay in service info container
                    serviceInfo.innerHTML = "This service is running to schedule";

                // if the service is cancelled
                } else if (serviceCancelled === true) {

                    // insert reason for cancelled service
                    serviceInfo.innerHTML = cancelReason;

                // if service is cancelled but there is no reason why
                } else if (serviceCancelled === true && cancelReason === null) {

                    // insert reason for delay in service info container
                    serviceInfo.innerHTML = "This service has been cancelled";

                }

                // if variable is null
                if (currentStationEstimated === null) {

                    // declare variable
                    var currentStationStatus = currentStationActualDepartTime;
                } else if (currentStationActualDepartTime === null) {
                    // declare variable
                    var currentStationStatus = currentStationEstimated;
                }

                if(currentStationEstimated === "On time") {

                        var currentDepartAndStatus = "<span class='depart-time'>" + currentStationDepartTime + "</span><span class='expected-departure ontime'> " + currentStationStatus +"</span></span>";
                    
                    } else if (currentStationEstimated !== "On time") {

                        var currentDepartAndStatus = "<span class='depart-time'>" + currentStationDepartTime + "</span><span class='expected-departure delayed'> " + currentStationStatus +"</span></span>";

                    }

                // template for current calling point
                var currentCallingPointElement = "<span class='calling-point'>" + currentStationName + "</span>" +
                    "<span class='calling-point-info'>" + currentDepartAndStatus;

                // push to array
                callingPointsArr.push(currentCallingPointElement);

                // loop through calling points object
                for (var i = 0; i < subsequentCallingPoints.length; i++) {

                    // variables for subsequent calling points info
                    var subsequentCallingPointsNames = subsequentCallingPoints[i].locationName;
                    var subsequentCallingPointsDepartTime = subsequentCallingPoints[i].st;
                    var subsequentCallingPointsEstimatedDepartTime = subsequentCallingPoints[i].et;
                    var subsequentCallingPointsActualDepartTime = subsequentCallingPoints[i].at;

                    // if variable is null
                    if (subsequentCallingPointsEstimatedDepartTime === null) {

                        // declare variable
                        var subsequentCallingPointsStatus = subsequentCallingPointsActualDepartTime;
                    } else if (subsequentCallingPointsActualDepartTime === null) {

                        // declare variable
                        var subsequentCallingPointsStatus = subsequentCallingPointsEstimatedDepartTime;
                    }

                    if(subsequentCallingPointsEstimatedDepartTime === "On time") {

                        var subsequentDepartAndStatus = "<span class='depart-time'>" + subsequentCallingPointsDepartTime + "</span><span class='expected-departure ontime'> " + subsequentCallingPointsStatus +"</span></span>";
                    
                    } else if (subsequentCallingPointsDepartTime !== "On time") {
                        var subsequentDepartAndStatus = "<span class='depart-time'>" + subsequentCallingPointsDepartTime + "</span><span class='expected-departure delayed'> " + subsequentCallingPointsStatus +"</span></span>";

                    }

                    // var subsequentDepartAndStatus = "<span class='depart-time'>" + subsequentCallingPointsDepartTime + "</span><span class='expected-departure'> " + subsequentCallingPointsStatus +"</span></span>";

                    // template for subsequent calling points
                    var subsequentCallingPointElement = "<span class='calling-point'>" + subsequentCallingPointsNames + "</span>" +
                        "<span class='calling-point-info'>" + subsequentDepartAndStatus;

                    // log to console
                    // console.log(subsequentCallingPointElement)

                    // push to array
                    callingPointsArr.push(subsequentCallingPointElement);

                }

                // declare callingPoints variable
                var callingPoints = document.querySelectorAll("calling-point");

                // log to console
                // console.log(callingPointsArr);

                // insert station code and full stationname of elements 
                currentStationElement.innerHTML = currentStationCode;
                destinationStationElement.innerHTML = destinationStationCode;
                currentStationFullElement.innerHTML = currentStationName;
                destinationStationFullElement.innerHTML = destinationStationName;
                callingPointsContainer.innerHTML = ""
                callingPointsContainer.innerHTML += callingPointsArr.join("");

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