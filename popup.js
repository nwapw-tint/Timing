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
	if (msg.to == "popup") {
		console.log(msg);
		if (msg.action == "update") {
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
		}
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



//Local copies
var sessions = [];
var sessionRunning = false;

var wColor = {"r": 0, "g": 255, "b": 0, "a": 100};
var bColor = {"r": 255, "g": 0, "b": 0, "a": 100};
var blacklistedSites = [];

var mouseX = 0, mouseY = 0;

var colorWheelImg;
var colorWheelData;



document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('click', (e) => {
		mouseX = e.screenX - window.screenX - 7;
		mouseY = e.screenY - window.screenY - 5;
		console.log("X = " + mouseX + " Y = " + mouseY);
	}, false);
	
	addClickListener('add_session_button', () => {
		var input = document.getElementById('time_input').value;
		if (isNaN(input))
			showError("Input is not a number!");
		else if (input.length == 0)
			showError("Input is empty!");
		else {
			addSession(input);
		}
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
			}
			document.getElementById('site_input').value = "";
		}
	});
	
	addClickListener('start_session_button', () => {
		if (sessions.length == 0) {
			showError("No sessions!");
		} else if (sessionRunning) {
			showError("Session already started!");
		} else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
		}
	});
	
	addClickListener('stop_session_button', () => {
		if (!sessionRunning) {
			showError("Session not started!");
		} else {
			sessionRunning = false;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
		}
	});
	
	addClickListener('whitelisted_radio', () => {
		let color = getColorFromWheel(mouseX, mouseY);
		if (color) {
			wColor.r = color.r;
			wColor.g = color.g;
			wColor.b = color.b;
		}
	});
	
	addClickListener('blacklisted_radio', () => {
		let color = getColorFromWheel(mouseX, mouseY);
		if (color) {
			bColor.r = color.r;
			bColor.g = color.g;
			bColor.b = color.b;
		}
	});
	
	let canvas = document.createElement('canvas');
	let context = canvas.getContext('2d');
	colorWheelImg = document.getElementById('wheel_img');
	console.log(colorWheelImg);
	canvas.width = colorWheelImg.width;
	canvas.height = colorWheelImg.height;
	context.drawImage(colorWheelImg, 0, 0);
	colorWheelData = context.getImageData(0, 0, colorWheelImg.width, colorWheelImg.height);
}, false);

function getColorFromWheel(x, y) {
	if (x < 0 || x >= colorWheelImg.width || y < 0 || y >= colorWheelImg.height)
		return null;
	let index = (y * colorWheelImg.width + x) * 4;
	if (colorWheelData.data[index + 3] < 255)
		return null;
	return {"r": colorWheelData.data[index], "g": colorWheelData.data[index + 1], "b": colorWheelData.data[index + 2], "a": colorWheelData.data[index + 3],};
}

function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	let str = "";
	if (h < 10)
		str += "0";
	str += h + ":";
	if (m < 10)
		str += "0";
	str += m + ":";
	if (s < 10)
		str += "0";
	return str + s;
}

function updateSessionText() {
	var sessionText = "";
	for (let i = 0; i < sessions.length; i++) {
		sessionText += timeToDigital(sessions[i]);
		if (i != sessions.length - 1)
			sessionText += "<br>";
	}
	document.getElementById('sessions_text').innerHTML = sessionText;
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