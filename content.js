var tintId;

//Sets the tint's color
function setTintColor(color) {
	let div = document.getElementById(tintId);
	if (div && color)
		div.style.background = color;
}

//Enables the tint
function enableTint(id, color, duration) {
	//Defaults
	if (!id)
		id = "tint-default";
	if (!color)
		color = "rgba(0,0,0,0.2)"; //Default color
	if (!duration) //Seconds
		duration = 100;
	
	if (document.querySelector('[id^="tint-"]') == null)
	{
		var tintDiv = document.createElement("div");
		tintDiv.id = (tintId = id); //allows removal by id
		tintDiv.style.background = color;
		styleTint(tintDiv);
		setupText();
		document.body.appendChild(tintDiv);
	} else
		setTintColor(color);
	
	function setupText() { //creates an empty text wrapper, allowing innerHTML to be added.
		//roboto font
		document.head.append(robotoFont);
		
		var textDiv = document.createElement("div");
		textDiv.id = "textDiv";
		textDiv.style.position = "absolute";
		textDiv.style.top = "50%";
		textDiv.style.left = "50%";
		textDiv.style.marginRight = "-50%";
		textDiv.style.transform="translate(-50%, -50%)";
		textDiv.style.backgroundColor = "rgba(255, 255, 255, 1)";
		textDiv.style.fontFamily = "'Roboto', Sans Serif";
		textDiv.style.color = "rgba(0, 0, 0, 1)"; //TODO: set automatically based on tint shade
		textDiv.style.fontSize = "80px"; //TODO: self adjusting size. rn, just set a cap
		textDiv.style.zIndex = 100;
		textDiv.style.opacity == 0;
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
	
	var robotoFont = document.createElement('link');
	robotoFont.setAttribute('rel', 'stylesheet');
	robotoFont.setAttribute('type', 'text/css');
	robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
}

//Disables the tint
function disableTint() {
	let div = document.getElementById(tintId);
	if (div)
		div.parentNode.removeChild(div);
}
