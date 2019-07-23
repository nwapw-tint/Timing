//Sets the tint's color
function setTintColor(color) {
	let div = document.getElementById("tint");
	if (div && color)
		div.style.background = color;
}
  
//Enables the tint
async function enableTint(color,sessionRunning) {
	if (!document.getElementById("tint"))
	{
		var tintDiv = document.createElement("div");
		tintDiv.id = "tint";
		styleTint(tintDiv);
		setupText();
		currentColor = 0;
		//FADE in if first, no fade if not first
		if (!sessionRunning) {
			//Arrayified for editing
			color = color.replace(/[^\d,.]/g, '').split(',')
			//Increments the tint until it is close to the desired value, then smoothly moves towards it
			while (currentColor < color[3] - 0.005) {
				currentColor += (Math.min(0.02, (color[3] - currentColor) / 2));
				await sleep(20);
				rgbaStr = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + currentColor + ")";
				tintDiv.style.background = rgbaStr;
			}
		} else
			tintDiv.style.background = color;

	} else
		setTintColor(color);

	//Creates an empty text wrapper, allowing innerHTML to be added
	function setupText() {
		var textDiv = document.createElement("div");
		textDiv.id = "textDiv";
		textDiv.style.position = "absolute";
		textDiv.style.top = "50%";
		textDiv.style.left = "50%";
		textDiv.style.marginRight = "-50%";
		textDiv.style.transform = "translate(-50%, -50%)";
		textDiv.style.backgroundColor = "rgba(255, 255, 255, 1)";
		textDiv.style.color = "rgba(0, 0, 0, 1)"; //TODO: set automatically based on tint shade
		textDiv.style.zIndex = MAX_Z_VALUE;
		textDiv.style.opacity = 0;
		tintDiv.appendChild(textDiv);
	}

	//Styles the tint div
	function styleTint(div) {
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
		alert("running cycle then removing")
		runCycleThenRemove(div);
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
		console.log("Connected to the background script");
		break;
	case "tint":
		switch (msg.mode) {
		case "enable":
			enableTint(msg.color,msg.sessionRunning);
			break;
		case "disable":
			disableTint();
			break;
		case "change":
			setTintColor(msg.color);
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



const fadeDuration = 1400;
const fadeStep = 200;

/*var robotoFont = document.createElement('link');
robotoFont.setAttribute('rel', 'stylesheet');
robotoFont.setAttribute('type', 'text/css');
robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");*/

//Adds the text to the div
function addText(text, time)
{
	charCount = text.length;
    textDiv = document.getElementById("textDiv")
    if (textDiv && textDiv.style.opacity == 0) {    
		textDiv.style.opacity = 1;
		textDiv.style.fontSize = (80+(Math.floor(120/charCount)))+"px";
		textDiv.style.wordWrap = "break-word";
        textDiv.innerHTML = text + " " + timeToDigital(time);
        fadeOut(textDiv);
        setTimeout(() => {
            textDiv.innerHTML = text + " " + timeToDigital(time - 1);
        }, 1000); //faux dynamic feeling
    }

    //Fades the target element.
    function fadeOut(fadeTarget) {
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
}

var cycleInterval = 200;
var rainbow = ['rgba(254,55,72,1)',
'rgba(205, 26, 198,1)',
'rgba(33, 134, 252,1)',
'rgba(33, 252, 239,1)',
'rgba(33, 252, 127,1)',
'rgba(33, 252, 127,1)',
'rgba(222, 252, 33,1)',
'rgba(252, 118, 33,1)',
'rgba(254,55,72,1)'];//SHOULD BE EVEN
cCycle = 0;
spacer = 0;
function runCycleThenRemove(element)
{
		timer = setInterval(function() {
			element.style.background = rainbow[cCycle];
			spacer = Math.abs(cCycle-Math.floor(rainbow.length/2))
			cCycle++;
		}, cycleInterval+spacer*100)
		setTimeout(function(){clearInterval(timer);
			element.parentNode.removeChild(element);
		}, rainbow.length*cycleInterval*2);
		}
