//Sets the tint's color
function setTintColor(color) {
	let div = document.getElementById("tint");
	if (div && color) {
		console.log("setting tint color")
		div.style.backgroundColor = color;
	}
}
  
//Enables the tint
function enableTint(color) {
	if (!document.getElementById("tint")) {
		var tintDiv = document.createElement("div");
		tintDiv.id = "tint";
		appendFonts();
		styleTint(tintDiv);
		setupText();
		console.log("fading in the color "+color)
		fadeIn(tintDiv,color, 50, 500);
	} else{
		console.log("existing tint, changing the color")
		setTintColor(color);}

	//Creates an empty text wrapper, allowing innerHTML to be added
	function setupText() {
		var textDiv = document.createElement("div");
		textDiv.id = "textDiv";
		textDiv.style.fontFamily = "Roboto,sans-serif";
		//console.log(textDiv.style.fontFamily);
		textDiv.style.position = "absolute";
		textDiv.style.top = "50%";
		textDiv.style.left = "50%";
		textDiv.style.marginBottom = "-50%";
		textDiv.style.marginRight = "-50%";
		textDiv.style.transform = "translate(-50%, -50%)";
		textDiv.style.color = "rgba(255, 255, 255, 1)"; //TODO: set automatically based on tint shade
		textDiv.style.zIndex = MAX_Z_VALUE;
		textDiv.style.opacity = 0;
		tintDiv.appendChild(textDiv);
	}
	//appends fonts
	function appendFonts()
	{
	var link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
	document.documentElement.appendChild(link);
	}
	//Styles the tint div
	function styleTint(div) {
		div.style.mixBlendMode = "multiply";
		div.style.width = "100%";
		div.style.height = "100%";
		div.style.pointerEvents = "none";	
		div.style.zIndex = MAX_Z_VALUE;
		div.style.top = 0;
		div.style.left = 0;
		div.style.position = "fixed";
		div.style.display = "inline-block";
		document.body.appendChild(tintDiv);
	}
}

//Disables the tint
function disableTint() {
	let div = document.getElementById("tint");
	if (div != null){
		//console.log("removing tint")
		div.parentNode.removeChild(div);
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
	if (msg.to != "content")
		return;
	switch (msg.action) {
	case "open":
		//console.log("Connected to the background script");
		break;
	case "tint":
		switch (msg.mode) {
		case "enable":
			console.log("running enableTint")
			enableTint(msg.color);
			break;
		case "disable":
			disableTint();
			break;
		case "change":
			if(!fadeOn){
				console.log("running setTintColor")
				setTintColor(msg.color);
			}
			break;
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
function addText(text, time)
{
	charCount = text.length;
    textDiv = document.getElementById("textDiv")
    if (textDiv && textDiv.style.opacity == 0) {    
		textDiv.style.opacity = 1;
		textDiv.style.fontSize = (120+(Math.floor(120/charCount)))+"px";
		textDiv.style.wordWrap = "break-word";
        textDiv.innerHTML = text + " " + timeToDigital(time);
        fadeOut(textDiv,fadeStep,fadeDuration);
        setTimeout(() => {
            textDiv.innerHTML = text + " " + timeToDigital(time - 1);
        }, 1000); //faux dynamic feeling
    }
}
fadeStep = 100;
fadeDuration = 1400;
    //Fades the target element.
    function fadeOut(fadeTarget, fadeStep, fadeDuration) { //TODO: rewrite this
        var fadeEffect = setInterval(() => {
            if (!fadeTarget.style.opacity)
                fadeTarget.style.opacity = 1;
            if (fadeTarget.style.opacity > 0.001)
                fadeTarget.style.opacity -= fadeStep / fadeDuration;
            else {
                clearInterval(fadeEffect);
                fadeTarget.style.opacity = 0;
            }
        }, fadeStep);
	}
	fadeOn = false;
	//RGBA alpha value incrementer towards a color
	function fadeIn(fadeTarget,color,fadeStep, fadeDuration){
		fadeOn = true;
		colorArray = color.replace(/[^\d,.]/g, '').split(',');
		targetA = Number(colorArray[3]);
		currentA = 0;
		var fadeEffect = setInterval(() => 
		{
			if(currentA < targetA-0.01){
				rgbaStr = "rgba(" + colorArray[0]+ "," + colorArray[1]+ "," + colorArray[2] + "," + String(currentA) + ")";
				console.log(rgbaStr + "with increment " + (fadeStep*targetA) / fadeDuration)
				fadeTarget.style.backgroundColor = rgbaStr; 
				currentA += fadeStep*targetA / fadeDuration;
			}    
			else{	//we reached the target alpha value
				fadeTarget.style.backgroundColor = "rgba(" + colorArray[0]+ "," + colorArray[1] + "," + colorArray[2] + "," + targetA+ ")";
				fadeOn = false;
				clearInterval(fadeEffect)}
			}, fadeStep);
	}
/*
var rainbow = ['rgb(254,55,72)',
'rgb(205, 26, 198)',
'rgb(33, 134, 252)',
'rgb(33, 252, 239)',
'rgb(33, 252, 127)',
'rgb(33, 252, 127)',
'rgb(222, 252, 33)',
'rgb(252, 118, 33)',
'rgb(254,55,72)'];//SHOULD BE EVEN, mess with colors later
cCycle = 0;
cSpacer = 0;
cDuration = 0;
ffadeStep = 100;
ffadeDuration = 1400;
function runCycleThenRemove(element)
{
	fadeIn(element, ffadeStep, ffadeDuration);
	setTimeout(function(){
		timer = setInterval(function() {
			element.style.background = rainbow[cCycle];
			cSpacer = Math.abs(cCycle-Math.floor(rainbow.length/2)) //mess with this stuff later
			cCycle++;
		}, 200+cSpacer*80)
		setTimeout(function(){clearInterval(timer);
			fadeOut(element,ffadeStep, ffadeDuration)
			//element.parentNode.removeChild(element);
		}, 3600); //TODO: remove this
	},ffadeDuration)
}
*/