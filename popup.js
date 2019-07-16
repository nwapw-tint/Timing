var sessions = [];
var currentSessionTime = 0;
var sessionRunning = false;

var whitelistedColor = {"r": 0, "g": 255, "b": 0, "a": 100};
var blacklistedColor = {"r": 255, "g": 0, "b": 0, "a": 100};

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
			startSession();
		}
	});
}, false);


function startSession() {
	sessionRunning = true;
	showSecondTimeout();
}

function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	return h + ":" + m + ":" + s;
}

function showSecondTimeout() {
	setTimeout(() => {
		sessions[0] = Math.max(sessions[0] - 1, 0);
		if (sessions[0] == 0) {
			const s = sessions;
			sessions.shift();
			updateSessionText();
			if (sessions.length == 0) {
				alert("All sessions finished!");
				sessionRunning = false;
			} else {
				alert("Session finished!");
				sessions = s;
				startSession();
			}
		} else {
			updateSessionText();
			showSecondTimeout();
		}
	}, 1000);
}

function updateSessionText() {
	var sessionText = "";
	for (let i = 0; i < sessions.length; i++)
		sessionText += "<br>" + timeToDigital(sessions[i]);
	document.getElementById('sessions_text').innerHTML = sessionText;
}

function addSession(time) {
	time *= 60;
	sessions.push(time);
	updateSessionText();
}

function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

function showError(error) {
	alert("ERROR: " + error);
}