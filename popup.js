//Local copies
var sessions = [];
var sessionRunning = false;
var nColor = "rgba(0, 255, 0, " + alpha + ")";
var bColor = "rgba(255, 0, 0, " + alpha + ")";

const maxTime = 1440;
const maxLength = 70;

var blacklistedSites = [];
var addToBlacklisted = false;

//Updates the session text only after the dom content loads
function updateSessionText() {
	if (document.getElementById('sessions_text'))
		ust();
	else
		document.addEventListener('DOMContentLoaded', () => {
			ust();
		}, false);
	
	//Update session text
	function ust() {
		let sessionText = "";
		const id = 'close_button_';

		//Adds all the cancel buttons, the name, and the time left for each session
		for (let i = 0; i < sessions.length; i++) {
			let shortName = sessions[i].name;
			let end = ": " + timeToDigital(sessions[i].time);
			let nameAndTime = shortName + end;
			if (stringWidth(nameAndTime, "WinReg", 13) > maxLength) {
				while (stringWidth(shortName + '...' + end, "WinReg", 13) > maxLength && shortName.length > 0)
					shortName = shortName.substring(0, shortName.length - 1);
				nameAndTime = shortName + '...' + end;
			}
			sessionText += '<button id="' + id + i + '">X</button>  ' + nameAndTime;
			if (i != sessions.length - 1)
				sessionText += "<br>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;

		//Sets up the cancel buttons
		for (let i = 0; i < sessions.length; i++)
			addClickListener(id + i, () => {
				sessions.splice(i, 1);
				if (sessions.length == 0)
					sessionRunning = false;
				updateSessionText();
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "sessions",
					sessions: sessions
				});
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "color",
					color: nColor
				});
			});
	}
}

//Adds a session to the queue
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

//Adds a click listener to the element with the id
function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback, false);
}

//Shows an error
function showError(error) {
	alert("ERROR: " + error);
}
