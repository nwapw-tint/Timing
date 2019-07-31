//Local copies
var sessions = [];
var sessionRunning = false;
var color = "rgba(0, 255, 0, " + alpha + ")";
const maxTime = 1440;
const maxLength = 120;

var recentChangeInvolvingFade = false;
//Updates the session text only after the dom content loads
function updateSessionText() {
	if (document.getElementById('sessions_text')) {
		ust();
	} else {
		document.addEventListener('DOMContentLoaded', ust);
	}

	//Update session text
	function ust() {
		if (updateSessionText.fontSize === undefined) {
			//The reason why 'name_input' is used is it was first in the file that had both the font-family and font-size in the css
			updateSessionText.fontSize = getPropertyFromElement(document.getElementById('name_input'), 'font-size');
			updateSessionText.fontFamily = getPropertyFromElement(document.getElementById('name_input'), 'font-family');
		}

		let sessionText = "";

		//Adds all the cancel buttons, the name, and the time left for each session
		for (let i = 0; i < sessions.length; i++) {
			let shortName = sessions[i].name;
			let end = "- " + timeToDigital(sessions[i].time);
			let nameAndTime = shortName + end;
			if (stringWidth(nameAndTime, updateSessionText.fontFamily, updateSessionText.fontSize) > maxLength) {
				while (stringWidth(shortName + '...' + end, updateSessionText.fontFamily, updateSessionText.fontSize) > maxLength && shortName.length > 0) {
					shortName = shortName.substring(0, shortName.length - 1);
				}
				nameAndTime = shortName + '...' + end;
			}
			sessionText += '<div id="close_paragraph_' + i + '" class="time" draggable="true" style="margin-bottom:5px; height:20px; width:150px; border-radius:7px; background-color:' + sessions[i].color + ';"><p style="position:relative; top:-3px; margin:0px; padding:0px; line-height:20px"><button style="position:relative; top:3px;outline:none; height:20px; width:20px; border-radius:7px 0px 0px 7px; font-size:15px;" class="close_button" id="close_button_' + i + '"></button>  ' + nameAndTime + "</p></div>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;

		//Sets up the cancel buttons
		for (let i = 0; i < sessions.length; i++) {
			let id = 'close_button_' + i;
			addClickListener(id, () => {
				if (recentChangeInvolvingFade){console.log("user attempted to cancel but it was rejected");return;}
				recentChangeInvolvingFade = true;
				sessions.splice(i, 1);
				if (sessions.length == 0) {
					sessionRunning = false;
					document.getElementById('start_stop_text').innerHTML = "Start";
				}
				updateSessionText();
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "sessions",
					sessions: sessions
				});
				setTimeout(() => {
					recentChangeInvolvingFade = false;
				}, fadeDuration * 2);
			});
			id = 'close_paragraph_' + i;
			document.getElementById(id).addEventListener('dragstart', (e) => {
				e.dataTransfer.setData("other id", e.target.id);
			});
			document.getElementById(id).addEventListener('dragover', (e) => {
				e.preventDefault();
			});
			document.getElementById(id).addEventListener('drop', (e) => {
				e.preventDefault();

				let otherId = e.dataTransfer.getData("other id");

				let selfIndex = id.charAt(id.length - 1);
				let otherIndex = otherId.charAt(otherId.length - 1);

				let self = sessions[selfIndex];
				let other = sessions[otherIndex];

				sessions.splice(selfIndex, 1, other);
				sessions.splice(otherIndex, 1, self);

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
}

//Adds a session to the queue
function addSession(time) {
	let name = document.getElementById('name_input').value;
	if (name.length == 0) {
		showError("Name is empty!");
	} else {
		let session = {
			time: readTimeInput(time),
			name: name,
			color: color
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

	function readTimeInput(time) {
		if (time.includes(":")) {
			return readNormalTime(time.split(':'));
		} else {
			return time * 60;
		}
	}

	function readNormalTime(timeA) {
		if (timeA.length == 0) {
			return 0;
		}
		return Number(timeA.pop()) + Number(60 * readNormalTime(timeA));
	}
}

//Adds a click listener to the element with the id
function addClickListener(id, callback) {
	document.getElementById(id).addEventListener('click', callback);
}

//Shows an error
function showError(error) {
	sendMessage({
		to: "background",
		from: "popup",
		action: "error",
		error: "ERROR: " + error
	});
}



/*-----------------------Communication-----------------------*/



//Creates the port
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
	if (msg.to != "popup") {
		return;
	}
	switch (msg.action) {
		case "open":
			console.log("Connected to the background script");
			break;
		case "update":
			switch (msg.place) {
				case "ETA":
					document.getElementById('session_label').innerHTML = "Sessions &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + msg.text;
					break;
				case "sessions":
					sessions = msg.sessions;
					if (sessions.length == 0) {
						sessionRunning = false;
						document.getElementById('start_stop_text').innerHTML = "Start";
					}
					updateSessionText();
					break;
				case "sessionRunning":
					sessionRunning = msg.sessionRunning;
					document.getElementById('start_stop_text').innerHTML = sessionRunning || (msg.runningBeforeOnChromeSite && sessions.length > 0) ? "Stop" : "Start";
					break;
				case "theme":
					document.getElementById('css_file').href = msg.theme;
					break;
				case "start_stop":
					document.getElementById('start_stop_button').disabled = (msg.currentSite.url.indexOf("chrome://") == 0);
					break;
			}
			break;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}



/*-----------------------On Load-----------------------*/



//Called when the popup loads
document.addEventListener('DOMContentLoaded', () => {

	document.getElementById('color_chooser').addEventListener('change', () => {
		color = hexToRgba(document.getElementById('color_chooser').value);
	});

	//Adds a session to the queue
	addClickListener('add_session_button', () => {
		if(recentChangeInvolvingFade){console.log("user attempted to add but it was rejected");return;}
		recentChangeInvolvingFade = true;
		var time = document.getElementById('time_input').value;
		if (time.length == 0) {
			showError("Time is empty!");
		} else if (time > maxTime) {
			showError("Time is too long!");
		} else if (time <= 0) {
			showError("Time is too short");
		} else if (time.includes(":")) {
			for (x of time.split(":")) {
				if (isNaN(x) || x > 60) {
					showError("Time is invalid!");
					break;
				}
			}
			addSession(time);
		} else if (isNaN(time)) {
			showError("Time is not a number!");
		} else {
			addSession(time);
		}
		setTimeout(function(){recentChangeInvolvingFade = false;},fadeDuration);
	});
clickedRecently = false;
	//Starts or stops the session
	addClickListener('start_stop_button', () => {
		if(clickedRecently){return;}
		clickedRecently = true;
		if (sessions.length == 0) {
			showError("No sessions!");
		} else if (sessionRunning) {
			sessionRunning = false;
			console.log("stopping timer");
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
			document.getElementById('start_stop_text').innerHTML = "Start";
		} else {
			console.log("starting timer");
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
			document.getElementById('start_stop_text').innerHTML = "Stop";
		}
		setTimeout(function(){clickedRecently = false}, fadeDuration);
	});

	addClickListener('moon', () => {
		if (document.getElementById('css_file').href.indexOf("windows_theme") != -1) {
			return;
		} else if (document.getElementById('css_file').href.indexOf("modern_dark") != -1) {
			document.getElementById('css_file').href = "../../css/modern_light.css";
		} else if (document.getElementById('css_file').href.indexOf("modern_light") != -1) {
			document.getElementById('css_file').href = "../../css/modern_dark.css";
		}
		sendMessage({
			to: "background",
			from: "popup",
			action: "update",
			place: "theme",
			theme: document.getElementById('css_file').href
		});
	});
});
