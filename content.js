//Sets the tint's color
function enableTint(color) {
	let div = document.getElementById("tint");
	if (div && color){
		div.style.background = color;
		div.style.opacity = opacity;
	}
}

//Disables the tint
function disableTint() {
	let div = document.getElementById("tint");
	if (div)
		div.style.opacity = 0;
}

//COMMUNICATION
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
			enableTint(msg.color);
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

//Once the page has loaded, check the running status and update the tint accordingly
document.addEventListener('DOMContentLoaded', () => {
	sendMessage({
		to: "background",
		from: "content",
		action: "checkRunning"
	});
}, false);

//ADD_TEXT
duration = 1400;
step = 200;
function addText(text, time)
{
    var robotoFont = document.createElement('link');
    robotoFont.setAttribute('rel', 'stylesheet');
    robotoFont.setAttribute('type', 'text/css');
    robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
    document.head.append(robotoFont);  
    
    textDiv = document.getElementById("textDiv")
    if (textDiv && textDiv.style.opacity == 0) {      
        //roboto font
        textDiv.style.opacity = 1;
        textDiv.innerHTML = text + " " + timeToDigital(time);
        fadeOut(textDiv);
        setTimeout(() => {
            textDiv.innerHTML = text + " " + timeToDigital(time - 1);
        }, 1000);//faux dynamic feeling
    }

    function fadeOut(fadeTarget) {
        var fadeEffect = setInterval(() => {
            if (!fadeTarget.style.opacity)
                fadeTarget.style.opacity = 1;
            if (fadeTarget.style.opacity > 0.001)
                fadeTarget.style.opacity -= step / duration;
            else {
                clearInterval(fadeEffect);
                fadeTarget.style.opacity = 0;
            }
        }, step);
    }
    
}
