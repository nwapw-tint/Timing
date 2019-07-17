var port = chrome.extension.connect({
	name: "popup"
});

//Tells the background script the popup script has opened
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
			updateSessionText();
		}
	} else
		console.log("popup reject");
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	console.log("popup send");
	port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



//Local copies
var sessions = [];
var currentSessionTime = 0;
var sessionRunning = false;

var whitelistedColor = {"r": 0, "g": 255, "b": 0, "a": 100};
var blacklistedColor = {"r": 255, "g": 0, "b": 0, "a": 100};
var blacklistedSites = [];



document.addEventListener('DOMContentLoaded', () => {
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
	updateSessionText();
}

function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

function showError(error) {
	alert("ERROR: " + error);
}