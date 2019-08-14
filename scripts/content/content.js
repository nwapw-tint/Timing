var textOn = false
text = "";
time = "";
var fadeOutEffect, fadeInEffect;
window.onload = () => {
	setTint(CLEAR_COLOR);
	sendMessage({
		to: "background",
		from: "content",
		action: "checkRunning"
	});
	document.addEventListener("keydown",event => {
		if(event.keyCode == 81 && event.ctrlKey){displayText()}});
}
function displayText()
{
	document.addEventListener("keyup",event => {if(event.keyCode == 81 || event.ctrlKey){hideText()}});
	updateTT();
	showText(text,time);
}
//Sets the tint's color
function setTint(color) {
	console.log("setting the tint div to "+color);
	tintDiv = document.getElementById("tint");
	if (!tintDiv) {
		var tintDiv = document.createElement("tint");
		tintDiv.id = "tint"
		tintDiv.style = "display: block; transition: none 0s ease 0s; margin: 0px; padding: 0px; border-radius: 0px; border: none; outline: none; visibility: visible; max-height: none; max-width: none; clip: unset; overflow: visible; opacity: 1; position: fixed; top: -10%; right: -10%; bottom: -10%; left: -10%; width: auto; height: auto; z-index: " + (MAX_Z_VALUE - 1) + "; mix-blend-mode: multiply;"
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
	textDiv.style.pointerEvents = "none";
	textDiv.style.mixBlendMode = "darken";
	textDiv.style.opacity = 1;
	textDiv.style.zIndex = MAX_Z_VALUE;
	document.documentElement.appendChild(textDiv);
/*
	var newStyle = document.createElement('style');
	newStyle.appendChild(document.createTextNode("\
    @font-face {\
    font-family: 'Orkney';\
    src: url('chrome-extension://__MSG_@@extension_id__/../fonts/orkney-regular.otf') format('otf');\
    }\
    "));
	document.documentElement.appendChild(newStyle);*/
}

//Disables the tint
function clearTint() {
	let tintDiv = document.getElementById("tint");
	if (tintDiv) {
		tintDiv.style.backgroundColor = "rgba(0,0,0,0)";
		console.log("clearTint caused removeText");
		removeText();
	} else {
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

function updateTT()
{
	sendMessage({
		to:"background",
		from: "content",
		action: "updateTT"
	})
}
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
		case "updateTT":
			text = msg.text;
			time = msg.time;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}

/*-----------------------Add Text-----------------------*/

//Adds the text to the div
function showText(text,time) {
	let charCount = text.length;
	let textDiv = document.getElementById("textDiv")
	textDiv.innerHTML = text;
	document.body.style.filter = "blur(0.5rem)";
	textDiv.style.color = "rgba(70, 70, 70, 0.8)"
	textDiv.style.fontSize = (120 + (Math.floor(120 / charCount))) + "px";
	textDiv.style.wordWrap = "break-word";
}

function hideText(){
	let textDiv = document.getElementById("textDiv")
	document.body.style.filter = "none";
	textDiv.style.color = "rgba(70, 70, 70, 0)"
}