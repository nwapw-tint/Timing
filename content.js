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
		makeTint(tintDiv);
		document.body.appendChild(tintDiv);
	} else
		setTintColor(color);
	
	function makeTint(div) {
		div.style.width = "100%";
		div.style.height = "100%";
		div.style.pointerEvents = "none";
		div.style.zIndex = 10000; //TODO: something about this
		div.style.top = 0;
		div.style.left = 0;
		div.style.position = "fixed";
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