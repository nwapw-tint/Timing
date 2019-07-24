//Local copies
var sessions = [];
var sessionRunning = false;
var nColor = "rgba(0, 255, 0, " + alpha + ")";
var bColor = "rgba(255, 0, 0, " + alpha + ")";
var blacklistedSites = [];
var addToBlacklisted = false;

const maxTime = 1440;
const maxLength = 147;

//Updates the session text only after the dom content loads
function updateSessionText() {
	if (document.getElementById('sessions_text'))
		ust();
	else
		document.addEventListener('DOMContentLoaded', ust, false);
	
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
				while (stringWidth(shortName + '...' + end, updateSessionText.fontFamily, updateSessionText.fontSize) > maxLength && shortName.length > 0)
					shortName = shortName.substring(0, shortName.length - 1);
				nameAndTime = shortName + '...' + end;
			}
			sessionText += '<p style="color:' + rgbaToRgb(sessions[i].color) + '; margin:0px; padding:0px; line-height:20px"><button style="height:20px; width:20px" id="close_button_' + i + '">X</button>  ' + nameAndTime + "</p>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;

		//Sets up the cancel buttons
		for (let i = 0; i < sessions.length; i++)
			addClickListener('close_button_' + i, () => {
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
	if (msg.to != "popup")
		return;
	switch (msg.action) {
	case "open":
		console.log("Connected to the background script");
		break;
	case "update":
		switch (msg.place) {
		case "sessions":
			sessions = msg.sessions;
			if (sessions.length == 0) {
				sessionRunning = false;
				document.getElementById('start_stop_text').innerHTML = "Start";
			}
			updateSessionText();
			break;
		case "blacklistedSites":
			blacklistedSites = msg.blacklistedSites;
			break;
		case "sessionRunning":
			sessionRunning = msg.sessionRunning;
			document.getElementById('start_stop_text').innerHTML = sessionRunning ? "Stop" : "Start";
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



//The mouse coordinates
var mouseX = 0, mouseY = 0;

//Called when the popup loads
document.addEventListener('DOMContentLoaded', () => {
	//Invoked when the mouse is moved
	window.addEventListener('mousemove', (e) => {
		mouseX = e.screenX - window.screenX - 10;
		mouseY = e.screenY - window.screenY - 8;
	}, false);

	document.getElementById('color_chooser').addEventListener('change', () => {
		nColor = hexToRgba(document.getElementById('color_chooser').value);
	}, false);

	//Invoked when the mouse is clicked
	window.addEventListener('click', (e) => {
		let color = nColor;
		if (color)
			if (addToBlacklisted) {
				bColor = color;
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "bColor",
					bColor: color
				});
			} else
				nColor = color;
	});
	
	//Adds a session to the queue
	addClickListener('add_session_button', () => {
		var time = document.getElementById('time_input').value;
		if (time.length == 0)
			showError("Time is empty!");
		else if (isNaN(time)) {
			showError("Time is not a number!");
		} else if (time > maxTime)
			showError("Time is too long!");
		else
			addSession(time);
	});
	
	//Starts or stops the session
	addClickListener('start_stop_button', () => {
		if (sessions.length == 0)
			showError("No sessions!");
		else if (sessionRunning) {
			sessionRunning = false;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
			document.getElementById('start_stop_text').innerHTML = "Start";
		}
		else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
			document.getElementById('start_stop_text').innerHTML = "Stop";
		}
	});

	addClickListener('css_button', () => {
		if (document.getElementById('css_file').href.indexOf("windows_theme") != -1)
			return;
		else if (document.getElementById('css_file').href.indexOf("modern_dark") != -1)
			document.getElementById('css_file').href = "css/modern_light.css";
		else if (document.getElementById('css_file').href.indexOf("modern_light") != -1)
			document.getElementById('css_file').href = "css/modern_dark.css";
	});
}, false);
