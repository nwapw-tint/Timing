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

		//Adds all the cancel buttons, the name, and the time left for each session
		for (let i = 0; i < sessions.length; i++) {
			let shortName = sessions[i].name;
			let end = ": " + timeToDigital(sessions[i].time);
			let nameAndTime = shortName + end;
			if (stringWidth(nameAndTime, "WinReg", 24) > maxLength) {
				while (stringWidth(shortName + '...' + end, "WinReg", 24) > maxLength && shortName.length > 0)
					shortName = shortName.substring(0, shortName.length - 1);
				nameAndTime = shortName + '...' + end;
			}
			sessionText += '<p style="color:' + rgbaToRgb(sessions[i].color) + '; margin:0; padding:0; line-height:20px"><button id="close_button_' + i + '">X</button>  ' + nameAndTime + "</p>";
		}
		document.getElementById('sessions_text').innerHTML = sessionText;

		//Sets up the cancel buttons
		for (let i = 0; i < sessions.length; i++)
			addClickListener('close_button_' + i, () => {
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
			if (sessions.length == 0)
				sessionRunning = false;
			updateSessionText();
			break;
		case "blacklistedSites":
			blacklistedSites = msg.blacklistedSites;
			break;
		case "sessionRunning":
			sessionRunning = msg.sessionRunning;
			break;
		}
		break;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}



/*-----------------------Color Selection-----------------------*/


var colorImg;
var colorData;
var notScaledImage;

//Returns the color found in the image at the coordinate (x, y)
function getColorFromImage (x, y) {
	x = Math.floor(x / (colorImg.width - 1) * (notScaledImage.width - 1));
	y = Math.floor(y / (colorImg.height - 1) * (notScaledImage.height - 1));
	if (x < 0 || x >= notScaledImage.width || y < 0 || y >= notScaledImage.height)
		return null;
	console.log(x, y);
	let index = (y * notScaledImage.width + x) * 4; //*4 because each color is 4 elements (r, g, b, and a)
	if (colorData[index + 3] < 255)
		return null;
	console.log("rgba(" + colorData.data[index] + "," + colorData.data[index + 1] + "," + colorData.data[index + 2] + ", " + alpha + ")");
	return "rgba(" + colorData.data[index] + "," + colorData.data[index + 1] + "," + colorData.data[index + 2] + ", " + alpha + ")";
}



/*-----------------------On Load-----------------------*/



//The mouse coordinates
var mouseX = 0, mouseY = 0;

//Called when the popup loads
document.addEventListener('DOMContentLoaded', () => {
	notScaledImage = new Image();
	notScaledImage.onload = () => {
		let canvas = document.createElement('canvas');
		let context = canvas.getContext('2d');
		colorImg = document.getElementById('color_img');
		canvas.width = notScaledImage.width;
		canvas.height = notScaledImage.height;
		context.drawImage(notScaledImage, 0, 0);
		colorData = context.getImageData(0, 0, notScaledImage.width, notScaledImage.height);
		console.log(colorData);
		console.log(colorImg.width + "x" + colorImg.height);
	};
	notScaledImage.src = "images/color_rectangle.png";


	//Invoked when the mouse is moved
	window.addEventListener('mousemove', (e) => {
		mouseX = e.screenX - window.screenX - 10;
		mouseY = e.screenY - window.screenY - 8;
	}, false);

	//Invoked when the mouse is clicked
	window.addEventListener('click', (e) => {
		let color = getColorFromImage(mouseX - colorImg.x, mouseY - colorImg.y);
		console.log(colorImg.x, colorImg.y, "IMAGE");
		console.log(mouseX, mouseY, "MOUSE");
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
	
	//Adds a blacklisted site
	addClickListener('add_site_button', () => {
		let site = document.getElementById('site_input').value;
		if (site.length == 0)
			showError("Site is empty!");
		else {
			let siteAlreadyBlacklisted = false;
			for (let i = 0; i < blacklistedSites.length && !siteAlreadyBlacklisted; i++)
				if (blacklistedSites[i] == site)
					siteAlreadyBlacklisted = true;
			if (!siteAlreadyBlacklisted) {
				blacklistedSites.push(site);
				sendMessage({
					to: "background",
					from: "popup",
					action: "push",
					place: "blacklistedSites",
					blacklistedSite: site
				});
				document.getElementById('site_input').value = "";
			}
		}
	});
	
	//Starts the session
	addClickListener('start_session_button', () => {
		if (sessions.length == 0)
			showError("No sessions!");
		else if (sessionRunning)
			showError("Session already started!");
		else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
		}
	});
	
	//Pauses the session
	addClickListener('pause_session_button', () => {
		if (!sessionRunning)
			showError("Session not started!");
		else {
			sessionRunning = false;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
		}
	});
	
	//Sets the add color mode to the normal color
	addClickListener('normal_radio', () => {
		addToBlacklisted = false;
	});
	
	//Sets the add color mode to change the blacklisted color
	addClickListener('blacklisted_radio', () => {
		addToBlacklisted = true;
	});
}, false);
