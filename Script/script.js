var globalMarker;
var initailLocation;
var map;
var x;

function getLocation() {
	x = document.getElementById("map");

	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, errorFunction);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function errorFunction(err) {
	x.innerHTML = err.message;
	initMap();
}

function showPosition(position) {
    initailLocation = {lat: position.coords.latitude, lng: position.coords.longitude};
    initMap();
}

function initMap() {
	console.log(initailLocation);
	var myLatlng = null;

	if(initailLocation == null) {
		myLatlng = {lat: 0, lng: 0};
	} else {
		myLatlng = {lat: initailLocation.lat, lng: initailLocation.lng};	
	}

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 3,
		center: myLatlng
	});

	globalMarker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		title: 'Your Location'
	});

	getMarkerInfo(myLatlng);

	map.addListener('click', function(e) {
		placeMarkerAndPanTo(e.latLng, map);
	});
}

function placeMarkerAndPanTo(latLng) {
	globalMarker.setMap(null);
	var marker = new google.maps.Marker({
		position: latLng,
		map: map
	});

	var latLngObj = {lat: latLng.lat(), lng: latLng.lng()};

	globalMarker = marker;
	getMarkerInfo(latLngObj);
}

function getMarkerInfo(latLng) {
	var lat = latLng.lat;
	var long = latLng.lng;

	var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&APPID=b7aaa3a349294d5706002e82df3de1ea&units=metric";

	$.getJSON(url, function (data) {
        console.log(data);
        getTimezone(lat, long, data);
    })
}

function getTimezone(latitude, longitude, weatherData) {
	var targetDate = new Date();
	var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60; // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC

	var url = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + latitude + ',' + longitude + '&timestamp=' + timestamp + '&key=AIzaSyDyw0f0L5QpsQviGGRaf2Q92PtLkjXSaB0';

	var pos = {lat: latitude, lng: longitude};

	$.getJSON(url, function (data) {
        var offsets = data.dstOffset * 1000 + data.rawOffset * 1000; // get DST and time zone offsets in milliseconds
        var localdate = new Date(timestamp * 1000 + offsets); // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
        console.log(localdate.toLocaleString());

        var infoToDisplay = "Weather: " + weatherData.weather[0].main + "<br />" + "Temperature: " + weatherData.main.temp + "C<br />" +
    					"Time Zone: " + data.timeZoneName + "<br />" + "Local Time: " + localdate.toLocaleString() + "<br />";

    	var infoWindow = new google.maps.InfoWindow;
    	infoWindow.setPosition(pos);
    	infoWindow.setContent(infoToDisplay);
    	infoWindow.open(map, globalMarker);
    	map.setCenter(pos);
    });
}