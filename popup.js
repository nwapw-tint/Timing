//Local copies
var sessions = [];
var sessionRunning = false;

const alpha = 0.3;
var nColor = "rgba(0, 255, 0, " + alpha + ")";
var bColor = "rgba(255, 0, 0, " + alpha + ")";

var mouseX = 0, mouseY = 0;

var blacklistedSites = [];

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
		session: {
			time: time,
			name: "make skynet",
			color: nColor
		}
	});
	updateSessionText();
}

function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

function showError(error) {
	alert("ERROR: " + error);
}
