//Local copies
var sessions = [];
var sessionRunning = false;

var wColor = "rgba(0,255,0,0.2)";
var bColor = "rgba(255,0,0,0.2)";
var blacklistedSites = [];

var mouseX = 0, mouseY = 0;

function updateSessionText() {
	var sessionText = "";
	for (let i = 0; i < sessions.length; i++) {
		sessionText += timeToDigital(sessions[i]);
		if (i != sessions.length - 1)
			sessionText += "<br>";
	}
	if (document.getElementById('sessions_text'))
		document.getElementById('sessions_text').innerHTML = sessionText;
	else
		document.addEventListener('DOMContentLoaded', () => {
			document.getElementById('sessions_text').innerHTML = sessionText;
		}, false);
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
