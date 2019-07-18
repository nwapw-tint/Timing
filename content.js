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
	if (msg.to == "content") {
		console.log(msg);
		if (msg.action == "tint") {
			if (msg.mode == "enable")
				enableTint(msg.id, msg.color, msg.opacity, msg.duration);
			else if (msg.mode == "disable")
				disableTint();
			else if (msg.mode == "change")
				setTintColor(rgbToHex(msg.color));
		}
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



document.addEventListener('DOMContentLoaded', () => {
	sendMessage({
		to: "background",
		from: "content",
		action: "checkRunning"
	});
}, false);



var tintId;



function setTintColor(color) {
	let div = document.getElementById(tintId);
	if (div && color)
		div.style.background = color;
}
//roboto font
var robotoFont = document.createElement('link');
robotoFont.setAttribute('rel', 'stylesheet');
robotoFont.setAttribute('type', 'text/css');
robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");

//Enables the tint
function enableTint(id, color, opacity, duration) {
	//Defaults
	if (!id)
		id = "tint-default";
	if (!color)
		color = "#fa8072";
	if (!opacity) //0 - Low, 1 - High
		opacity = 0.3;
	if (!duration) //Seconds
		duration = 100;
	
	if (document.querySelector('[id^="tint-"]') == null)
	{
		var tintDiv = document.createElement("div");
		tintDiv.id = id; //allows removal by id
		tintId = id;
		tintDiv.style.opacity = opacity;
		tintDiv.style.background = color;
		styleTint(tintDiv);
		setupText();
		document.body.appendChild(tintDiv);
	} else
		setTintColor(color);
	
		function setupText() //creates an empty text wrapper, allowing innerHTML to be added.
		{
			var textDiv = document.createElement("div");
			textDiv.id = "textDiv";
			textDiv.style.position = "absolute";
			textDiv.style.top = "50%";
			textDiv.style.left = "50%";
			textDiv.style.marginRight = "-50%";
			textDiv.style.transform="translate(-50%, -50%)";
			textDiv.style.backgroundColor = "rgba(255,255,255,1)";
			textDiv.style.fontFamily = "'Roboto', Sans Serif";
			textDiv.style.color = "#000"; //TODO: set automatically based on tint shade
			textDiv.style.fontSize = "60px"; //TODO: self adjusting size. rn, just set a cap
			textDiv.style.zIndex = 100;
			tintDiv.appendChild(textDiv);
		}
		function styleTint(div) {
			div.style.width = "100%";
			div.style.height = "100%";
			div.style.pointerEvents = "none";
			div.style.zIndex = 10000; //TODO: something about this
			div.style.top = 0;
			div.style.left = 0;
			div.style.position = "fixed";
			div.style.display = "inline-block";
		}
}

//Disables the tint
function disableTint() {
	let div = document.getElementById(tintId);
	if (div)
		div.parentNode.removeChild(div);
}

function rgbToHex(color) {
	return "#" + byteToHex(color.r) + byteToHex(color.g) + byteToHex(color.b);
	function byteToHex(c) {
		let hex = Number(c).toString(16);
		if (hex.length < 2)
			hex = "0" + hex;
		return hex;
	}
}