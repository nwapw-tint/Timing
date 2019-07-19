//Local copies
var sessions = [];
var sessionRunning = false;

const maxTime = 1440;

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
		let id = 'close_button_';
		for (let i = 0; i < sessions.length; i++) {
			let nameAndTime = sessions[i].name + ": " + timeToDigital(sessions[i].time);
			console.log(stringWidth(nameAndTime, "WinReg", 13));
			sessionText += '<button id="' + id + i + '">X</button>  ' + nameAndTime;
			if (i != sessions.length - 1)
				sessionText += "<br>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;
		for (let i = 0; i < sessions.length; i++)
			addClickListener(id + i, () => {
				sessions.splice(i, 1);
				updateSessionText();
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "sessions",
					sessions: sessions
				});
			});
	}
}
//adds a session to the queue
function addSession(time) {
	let name = document.getElementById('name_input').value;
	if (name.length == 0)
		showError("Name is empty!");
	else {
		let session = {
			time: time * 60,
			name: name,
			color: nColor
		};
		sessions.push(session);
		sendMessage({
			to: "background",
			from: "popup",
			action: "push",
			place: "sessions",
			session: session
		});
		updateSessionText();
		document.getElementById('time_input').value = "";
		document.getElementById('name_input').value = "";
	}
}

function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

function showError(error) {
	alert("ERROR: " + error);
}
