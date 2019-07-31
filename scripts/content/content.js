var textOn = false

var fadeOutEffect, fadeInEffect;

setTint(CLEAR_COLOR);
//Sets the tint's color
function setTint(color) {
	tintDiv = document.getElementById("tint");
	if(!tintDiv)
	{
		var tintDiv = document.createElement("tint");
		tintDiv.id = "tint"
		appendFonts();
		tintDiv.style = "display: block; transition: none 0s ease 0s; margin: 0px; padding: 0px; border-radius: 0px; border: none; outline: none; visibility: visible; max-height: none; max-width: none; clip: unset; overflow: visible; opacity: 1; position: fixed; top: -10%; right: -10%; bottom: -10%; left: -10%; width: auto; height: auto; z-index: "+(MAX_Z_VALUE-1)+"; mix-blend-mode: multiply;"
		tintDiv.style.pointerEvents = "none";
		document.documentElement.appendChild(tintDiv);
		setupText();
	}
	tintDiv.style.backgroundColor = color;
	console.log("set tint completed with color "+color)
}

//Creates an empty text wrapper, allowing innerHTML to be added
function setupText() {
	var textDiv = document.createElement("div");
	textDiv.style.mixBlendMode = "normal"
	textDiv.setAttribute('style', 'mixBlendMode:"normal"; !important');
	textDiv.id = "textDiv";
	textDiv.style.fontFamily = "Roboto,sans-serif";
	textDiv.style.position = "fixed";
	textDiv.style.top = "50%";
	textDiv.style.left = "50%";
	textDiv.style.marginBottom = "-50%";
	textDiv.style.marginRight = "-50%";
	textDiv.style.transform = "translate(-50%, -50%)";
	textDiv.style.color = "rgba(255, 255, 255, 0)";
	textDiv.style.zIndex = MAX_Z_VALUE;
	tintDiv = document.getElementById("tint");
	document.documentElement.appendChild(textDiv);
}
//Appends fonts
function appendFonts() {
	let link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
	document.documentElement.appendChild(link);
}

//Disables the tint
function clearTint() {
	let tintDiv = document.getElementById("tint");
	if (tintDiv)
	{
		tintDiv.style.backgroundColor = "rgba(0,0,0,0)";
	}
	else {
		alert("no tint to clear");
	}
}



/*-----------------------Communication-----------------------*/



//Creates the port
var port = chrome.extension.connect({
	name: "content"
});

//Tells the background script the content script has opened
sendMessage({
	to: "background",
	from: "content",
	action: "open"
});

//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	if (msg.to != "content") {
		return;
	}
	switch (msg.action) {
		case "open":
			console.log("Connected to the background script");
			break;
		case "tint":
			switch (msg.mode) {
				case "set":
					setTint(msg.color);
					break;
				case "clear":
					clearTint();
			}
			break;
		case "add_text":
			addText(msg.text, msg.time);
			break;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}

//Once the page has loaded, check the running status and updates the tint accordingly
document.addEventListener('DOMContentLoaded', () => {
	sendMessage({
		to: "background",
		from: "content",
		action: "checkRunning"
	});
});



/*-----------------------Add Text-----------------------*/



//Adds the text to the div
function addText(text, time) {
	console.log(text)
	if (textOn == false) {
		textOn = true;
		charCount = text.length;
		textDiv = document.getElementById("textDiv")
		if (textDiv) {
			textDiv.style.pointerEvents = "none";
			textDiv.style.mixBlendMode = "darken";
			textDiv.style.opacity = 0.7;
			textDiv.style.fontSize = (120 + (Math.floor(120 / charCount))) + "px";
			textDiv.style.wordWrap = "break-word";
			textDiv.innerHTML = text + " " + timeToDigital(time);
			textDiv.style.color = "rgba(70, 70, 70, 1)";
			setTimeout(() => {
				textDiv.style.color = "rgba(255, 255, 255, 0)";
				textOn = false;
			}, 1400);
			setTimeout(() => {
				textDiv.innerHTML = text + " " + timeToDigital(time - 1);
			}, 1000); //faux dynamic feeling
		}
	}
}



/*-------------------------Fading-------------------------*/


/*
//Fades the target element color property to an alpha of 0.
function fadeOut(fadeTarget, fadeStep, fadeDuration, callback = () => {}) {
	var cA = fadeTarget.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');
	var currentA = Number(cA[3]);
	if (currentA < 0.01) {
		console.log("the screen is already clear\nfadeOut over");
		return;
	}
	var totalA = currentA;
	var stepsToTake = fadeDuration / fadeStep;
	fadeOutEffect = setInterval(() => {
		if (currentA > 0.01) {
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + currentA + ")";
			currentA -= totalA / stepsToTake;
			console.log("fadeOut is still looping")
		} else {
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + 0 + ")";
			clearInterval(fadeOutEffect);
			callback();
		}
	}, fadeStep);
}

//Fades the target element into a target color
function fadeIn(fadeTarget, color, fadeStep, fadeDuration) {
	var cA = color.replace(/[^\d,.]/g, '').split(',');
	var targetA = Number(cA[3]);
	var currentA = 0;
	fadeInEffect = setInterval(() => {
		if (currentA < targetA - 0.01) {
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + currentA + ")";
			currentA += (fadeStep * targetA) / fadeDuration;
			console.log("fadeIn is looping")
		} else { //we reached the target alpha value
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + targetA + ")";
			clearInterval(fadeInEffect);
		}
	}, fadeStep);
}
*/