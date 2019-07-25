
//Sets the tint's color
function setTintColor(color) {
	let div = document.getElementById("tint");
	if (div && color) {
		console.log("fading out and then fading in")
		fadeOut(div,50,500);
		setTimeout(function(){fadeIn(div,color,50,500)},500);
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
		fadeOut(div, 50,500);
		setTimeout(function(){div.parentNode.removeChild(div)},500);
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
    //Fades the target element.
	function fadeOut(fadeTarget, fadeStep, fadeDuration) {
		console.log("fade out begun")
        var fadeEffect = setInterval(() => {
            if (!fadeTarget.style.opacity)
                fadeTarget.style.opacity = 1;
            if (fadeTarget.style.opacity > 0.001)
                fadeTarget.style.opacity -= fadeStep / fadeDuration;
            else {
				clearInterval(fadeEffect);
				fadeTarget.style.opacity = 0;
				console.log("fade out ended")
            }
        }, fadeStep);
	}
	//RGBA alpha value incrementer towards a color
	function fadeIn(fadeTarget,color,fadeStep, fadeDuration){
		console.log("fade in begun")
		const cA = color.replace(/[^\d,.]/g, '').split(',');
		const targetA = Number(cA[3]);
		const currentA = 0;
		var fadeEffect = setInterval(() => 
		{
			if(currentA < targetA-0.01)
			{ 
				fadeTarget.style.backgroundColor = "rgba(" + cA[0]+ "," + cA[1]+ "," + cA[2] + "," + currentA + ")";
				currentA += fadeStep*targetA / fadeDuration;
			}    
			else
			{	//we reached the target alpha value
				fadeTarget.style.backgroundColor = "rgba(" + cA[0]+ "," + cA[1] + "," + cA[2] + "," + targetA+ ")";
				clearInterval(fadeEffect)}
				console.log("fade in ended")
			}, fadeStep);
	}