//Local copies
var sessions = [];
var sessionRunning = false;

var wColor = {"r": 0, "g": 255, "b": 0, "a": 100};
var bColor = {"r": 255, "g": 0, "b": 0, "a": 100};
var blacklistedSites = [];

var mouseX = 0, mouseY = 0;

function updateSessionText() {
	if (document.getElementById('sessions_text')) {
		ust();
	} else {
		document.addEventListener('DOMContentLoaded').addEventListener(() => {
			ust();
		}, false);
	}

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
