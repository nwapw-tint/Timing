var textOn = false
isBlacklisted = false;
var fadeOutEffect, fadeInEffect;
var fading = false;
//Sets the tint's color
function setTint(color) {
	if(fading){return;}
	let div = document.getElementById("tint");
	if (div && color) {
		fadeOut(div, fadeStep, fadeDuration/2, 
			fadeIn(div,color,fadeStep, fadeDuration/2)
			);
		
	}
	else{console.log("no div found, not setting a color")}
}
  
//Enables the tint
function enableTint(color) {
	if (!document.getElementById("tint")) {
		var tintDiv = document.createElement("div");
		tintDiv.id = "tint";
		appendFonts();
		styleDiv(tintDiv);
		setupText();
		//console.log("calling fadeIn() from EnableTint()");
		fadeIn(tintDiv, color, fadeStep, fadeDuration);
	} else {
		//console.log("enableTint calls setTint (existing tint)");
		setTint(color);
	}
}
//Creates an empty text wrapper, allowing innerHTML to be added
function setupText() {
	var textDiv = document.createElement("div");
	textDiv.style.mixBlendMode = "normal"
	textDiv.setAttribute('style', 'mixBlendMode:"normal"; !important' );
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

//Styles the tint div
function styleDiv(div) {
	div.style.mixBlendMode = "multiply";
	div.style.width = "100%";
	div.style.height = "100%";
	div.style.pointerEvents = "none";	
	div.style.zIndex = MAX_Z_VALUE-1;
	div.style.top = 0;
	div.style.left = 0;
	div.style.position = "fixed";
	div.style.display = "inline-block";
	document.body.appendChild(div);
}
//Disables the tint
function pauseTint() {
	//console.log("attempting to pause the tint")
	if(document.getElementById("tint"))
	fadeOut(document.getElementById("tint"), fadeStep, fadeDuration)
	else{alert("no tint to pause")}
}

//Removes the tint
function removeTint() {	
	if(addingTint)
	{
	let div = document.getElementById("tint");
	if (div) {
		fadeOut(div, fadeStep, fadeDuration);
		setTimeout(() => {
			div.remove();
		}, fadeDuration);
	}
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
		case "enable":
			enableTint(msg.color);
			break;
		case "pause":
			console.log("pauseContentTint calls pauseTint, calls fadeOut()")
			pauseTint();
			break;
		case "remove":
			removeTint();
			break;
		case "change":
			console.log("updatePopupTint() calls setTint, calls fade")
			setTint(msg.color);
			
			break;
		case "blackout":
			setBlackout(msg.color);
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
}, false);



/*-----------------------Add Text-----------------------*/



//Adds the text to the div
function addText(text, time) {
	console.log(textOn);
	if(textOn == false)
	{
		textOn = true;
		charCount = text.length;
		textDiv = document.getElementById("textDiv")
		if (textDiv) {    
			textDiv.style.mixBlendMode = "normal";
			textDiv.style.opacity = 1;
			textDiv.style.fontSize = (120+(Math.floor(120/charCount)))+"px";
			textDiv.style.wordWrap = "break-word";
			textDiv.innerHTML = text + " " + timeToDigital(time);
			textDiv.style.color = "rgba(255,255,255,1)";
			setTimeout(() => {
				textDiv.style.color = "rgba(255,255,255,0)";
				textOn = false;
			}, 1400);
			setTimeout(() => {
				textDiv.innerHTML = text + " " + timeToDigital(time - 1);
			}, 1000); //faux dynamic feeling
		}
	}
}



/*-------------------------Fading-------------------------*/

//Fades the target element color property to an alpha of 0.
function fadeOut(fadeTarget, fadeStep, fadeDuration,callback = function(){}) {
	console.log("fadeOut reads: "+fading)
	if(fading){"ABORT OCCURRED THE CODE SUCKS";return;}
	fading = true;
	var cA = fadeTarget.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');
	var currentA = Number(cA[3]);
	if(currentA < 0.01){fading = false;console.log("the screen is already clear\nfadeOut over");return;}
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
			fading = false; console.log("fadeOut over, fading is now "+fading)
		}
	}, fadeStep);
}

//Fades the target element into a target color
function fadeIn(fadeTarget, color, fadeStep, fadeDuration) {
	console.log("fadeIn reads: "+fading)
	if(fading){console.log("ABORT OCCURED THE CODE SUCKS");return;}
	fading = true;
	var cA = color.replace(/[^\d,.]/g, '').split(',');
	var targetA = Number(cA[3]);
	var currentA = 0;
	fadeInEffect = setInterval(() => {
		if (currentA < targetA - 0.01) {
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + currentA + ")";
			currentA += (fadeStep * targetA) / fadeDuration;
			console.log("fadeIn is looping")
		} else {//we reached the target alpha value
			fadeTarget.style.backgroundColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + targetA + ")";
			clearInterval(fadeInEffect);
			fading = false; console.log("fadeIn over, fading is now "+fading)
		}
	}, fadeStep);
}

function setBlackout(color) {
	console.log("if this worked it would black this page out to "+color); //undefined?

/* 	let cA = color.replace(/[^\d,.]/g, '').split(',');
	let opaqColor = "rgba(" + cA[0] + "," + cA[1] + "," + cA[2] + "," + "1)";
	if (!isBlacklisted) {
		console.log(opaqColor + " on " + location);
		isBlacklisted = true;
		let blackDiv = document.createElement("div");
		blackDiv.id = "black";
		styleDiv(blackDiv);
		fadeIn(blackDiv, opaqColor, fadeStep, fadeDuration);
	} else if (!fadingIn) {
		let blackDiv = document.getElementById("black");
		if (blackDiv.style.backgroundColor != opaqColor) {
			blackDiv.style.backgroundColor = opaqColor;
		}
	}*/
}