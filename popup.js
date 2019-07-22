//Local copies
var sessions = [];
var sessionRunning = false;

const alpha = 0.3;
var wColor = "rgba(0, 255, 0, " + alpha + ")";
var bColor = "rgba(255, 0, 0, " + alpha + ")";
var blacklistedSites = [];

var mouseX = 0, mouseY = 0;
var addToBlacklisted = false;

function updateSessionText() {
	if (document.getElementById('sessions_text'))
		ust();
	else
		document.addEventListener('DOMContentLoaded', () => {
			ust();
		}, false);
//update session text
	function ust() {
		let sessionText = "";
		for (let i = 0; i < sessions.length; i++) {
			sessionText += timeToDigital(sessions[i]);
			if (i != sessions.length - 1)
				sessionText += "<br>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;
	}
}

function addSession(time) {
	time *= 60;
	sessions.push(time);
	sendMessage({
		to: "background",
		from: "popup",
		action: "push",
		place: "sessions",
		time: time
	});
	sendMessage({
		to: "background",
		from: "popup",
		action: "push",
		place: "colors",
		wColor: wColor,
		bColor: bColor
	});
	updateSessionText();
}

function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

function showError(error) {
	alert("ERROR: " + error);
}
//COMMUNICATION
var port = chrome.extension.connect({
	name: "popup"
});

//Tells the background script the content script has opened
sendMessage({
	to: "background",
	from: "popup",
	action: "open"
});

//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	if (msg.to != "popup")
		return;
	switch (msg.action) {
	case "open":
		console.log("Connected to the background script");
		break;
	case "update":
		switch (msg.place) {
		case "sessions":
			sessions = msg.sessions;
			if (sessions.length == 0)
				sessionRunning = false;
			updateSessionText();
			break;
		case "blacklistedSites":
			blacklistedSites = msg.blacklistedSites;
			break;
		case "sessionRunning":
			sessionRunning = msg.sessionRunning;
			break;
		}
		break;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}

//ON_LOAD
maxInput = 10000;
document.addEventListener('DOMContentLoaded', () => {
	let canvas = document.createElement('canvas');
	let context = canvas.getContext('2d');
	colorWheelImg = document.getElementById('wheel_img');
	canvas.width = colorWheelImg.width;
	canvas.height = colorWheelImg.height;
	console.log(canvas.width, canvas.height);
	context.drawImage(colorWheelImg, 0, 0);
	colorWheelData = context.getImageData(0, 0, colorWheelImg.width, colorWheelImg.height);

	window.addEventListener('mousemove', (e) => {
		mouseX = e.screenX - window.screenX - 11;
		mouseY = e.screenY - window.screenY - 9;
	}, false);

	window.addEventListener('click', (e) => {
		let color = getColorFromWheel(mouseX - colorWheelImg.x, mouseY - colorWheelImg.y);
		if (color)
			if (addToBlacklisted)
				bColor = color;
			else
				wColor = color;
	});
	
	addClickListener('add_session_button', () => {
		var input = document.getElementById('time_input').value;
		if (input.length == 0)
			showError("Input is empty!");
		else if (isNaN(input)){showError("Input is not a number!");document.getElementById('time_input').value = "";}
		else if (input > maxInput){showError("Input is too high!");document.getElementById('time_input').value = "";}
		else
			addSession(input);
	});
	
	addClickListener('add_site_button', () => {
		let site = document.getElementById('site_input').value;
		if (site.length == 0)
			showError("Site is empty!");
		else {
			let siteAlreadyBlacklisted = false;
			for (let i = 0; i < blacklistedSites.length && !siteAlreadyBlacklisted; i++)
				if (blacklistedSites[i] == site)
					siteAlreadyBlacklisted = true;
			if (!siteAlreadyBlacklisted) {
				blacklistedSites.push(site);
				sendMessage({
					to: "background",
					from: "popup",
					action: "push",
					place: "blacklistedSites",
					blacklistedSite: site
				});
				document.getElementById('site_input').value = "";
			}
		}
	});
	
	addClickListener('start_session_button', () => {
		if (sessions.length == 0)
			showError("No sessions!");
		else if (sessionRunning)
			showError("Session already started!");
		else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
		}
	});
	
	addClickListener('pause_session_button', () => {
		if (!sessionRunning)
			showError("Session not started!");
		else {
			sessionRunning = false;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
		}
	});

	addClickListener('cancel_session_button', () => {
		if (sessions.length == 0)
			showError("No sessions!");
		else {
			sessions.shift();
			if (sessions.length == 0)
				sessionRunning = false;
			updateSessionText();
			sendMessage({
				to: "background",
				from: "popup",
				action: "shift",
				place: "sessions"
			});
		}
	});
	
	addClickListener('whitelisted_radio', () => {
		addToBlacklisted = false;
	});
	
	addClickListener('blacklisted_radio', () => {
		addToBlacklisted = true;
	});
}, false);

//COLOR_SELECTION
var colorWheelImg;
var colorWheelData;

//Returns the color found in the image at the coordinate (x, y)
function getColorFromWheel (x, y) {
	console.log(x, y);
	if (x < 0 || x >= colorWheelImg.width || y < 0 || y >= colorWheelImg.height)
		return null;
	let index = (y * colorWheelImg.width + x) * 4; //*4 because each color is 4 elements (r, g, b, and a)
	if (colorWheelData.data[index + 3] < 255)
		return null;
	return "rgba(" + colorWheelData.data[index] + "," + colorWheelData.data[index + 1] + "," + colorWheelData.data[index + 2] + ", " + alpha + ")";
}
