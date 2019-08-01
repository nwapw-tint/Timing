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
		tintDiv.style = "display: block; transition: none 0s ease 0s; margin: 0px; padding: 0px; border-radius: 0px; border: none; outline: none; visibility: visible; max-height: none; max-width: none; clip: unset; overflow: visible; opacity: 1; position: fixed; top: -10%; right: -10%; bottom: -10%; left: -10%; width: auto; height: auto; z-index: "+(MAX_Z_VALUE-1)+"; mix-blend-mode: multiply;"
		tintDiv.style.pointerEvents = "none";
		document.documentElement.appendChild(tintDiv);
		setupText();
	}
	tintDiv.style.backgroundColor = color;
}

//Creates an empty text wrapper, allowing innerHTML to be added
function setupText() {
	var textDiv = document.createElement("div");
	textDiv.style.mixBlendMode = "normal"
	textDiv.setAttribute('style', 'mixBlendMode:"normal"; !important');
	textDiv.id = "textDiv";
	textDiv.style.fontFamily = "Orkney,sans-serif";
	textDiv.style.position = "fixed";
	textDiv.style.top = "50%";
	textDiv.style.left = "50%";
	textDiv.style.marginBottom = "-50%";
	textDiv.style.marginRight = "-50%";
	textDiv.style.transform = "translate(-50%, -50%)";
	textDiv.style.color = CLEAR_COLOR;
	textDiv.style.opacity = 1;
	textDiv.style.zIndex = MAX_Z_VALUE;
	tintDiv = document.getElementById("tint");
	document.documentElement.appendChild(textDiv);
	
	var newStyle = document.createElement('style');
	newStyle.appendChild(document.createTextNode("\
    @font-face {\
    font-family: 'Orkney';\
    src: url('chrome-extension://__MSG_@@extension_id__/../fonts/orkney-regular.otf') format('otf');\
    }\
    "));
	document.documentElement.appendChild(newStyle);
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
	if (textOn == false) {
		textOn = true;
		charCount = text.length;
		textDiv = document.getElementById("textDiv")
		if (textDiv) {
			textDiv.style.pointerEvents = "none";
			textDiv.style.mixBlendMode = "darken";
			i = 0;
			var blurFade = setInterval(function(){
				document.body.style.filter = "blur("+i/20+"rem)";
				textDiv.style.color = "rgba(70,70,70,"+i/10+")"
				 i+=0.1;
				 if(i > 8){clearInterval(blurFade);}
				},5) //80 intervals of 5 ms
			}

			textDiv.style.fontSize = (120 + (Math.floor(120 / charCount))) + "px";
			textDiv.style.wordWrap = "break-word";
			textDiv.innerHTML = text + " " + timeToDigital(time);
			setTimeout(() => {
				textDiv.style.color = CLEAR_COLOR;
				textOn = false;
				document.body.style.filter = "none";
			}, 1400);
			setTimeout(() => {
				textDiv.innerHTML = text + " " + timeToDigital(time - 1);
			}, 1000); //faux dynamic feeling
		}
	}



/*-------------------------Fading-------------------------*/



//Fades the target element color property to an alpha of 0.
function fadeOut(fadeTarget, fadeStep, fadeDuration, callback = () => {}) {
	var cA = fadeTarget.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');
	var currentA = Number(cA[3]);
	if (currentA < 0.01) {
		return;
	}
	var totalA = currentA;
	var stepsToTake = fadeDuration / fadeStep;
	fadeOutEffect = setInterval(() => {
		if (currentA > 0.01) {
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + currentA + ")";
			currentA -= totalA / stepsToTake;
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
		} else { //we reached the target alpha value
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + targetA + ")";
			clearInterval(fadeInEffect);
		}
	}, fadeStep);
}