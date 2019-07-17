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
	console.log("popup recieve");
	if (msg.to == "popup") {
		console.log("popup accept");
		console.log(msg);
		if (msg.action == "update" && msg.place == "sessions") {
			sessions = msg.value;
			if (sessions.length == 0)
				sessionRunning = false;
			updateSessionText();
		}
	} else
		console.log("popup ignore");
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	console.log("popup send");
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



document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('click', (e) => {
		mouseX = e.screenX - window.screenX - 7;
		mouseY = e.screenY - window.screenY - 5;
		console.log("X = " + mouseX + " Y = " + mouseY);
	}, false);
	
	addClickListener('add_button', () => {
		var input = document.getElementById('time_input').value;
		if (isNaN(input))
			showError("Input is not a number!");
		else if (input.length == 0)
			showError("Input is empty!");
		else {
			addSession(input);
		}
	});
	
	addClickListener('start_session_button', () => {
		if (sessions.length == 0) {
			showError("No sessions!");
		} else if (sessionRunning) {
			showError("Already started");
		} else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "start",
				place: "timer"
			});
		}
	});
}, false);

function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	return h + ":" + m + ":" + s;
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
		action: "update",
		place: "sessions",
		mode: "push",
		value: time
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