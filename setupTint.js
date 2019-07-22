//creates a blank filter for every page (must run at document_start on every page)
setupTint();

function setupTint(){
    if(document.getElementById("tint") == null)
    {
    //sets up a clear tint, to run at the beginning of the page
	var tintDiv = document.createElement("div");
	tintDiv.id = "tint";
	tintDiv.style.background = "rgba(0,0,0,0);"
	tintDiv.style.width = "100%";
	tintDiv.style.height = "100%";
	tintDiv.style.pointerEvents = "none";
	tintDiv.style.zIndex = 10000; //TODO: something about this
	tintDiv.style.top = 0;
	tintDiv.style.left = 0;
	tintDiv.style.position = "fixed";
    tintDiv.style.display = "inline-block";
    var textDiv = document.createElement("div");
    textDiv.id = "textDiv";
    textDiv.style.position = "absolute";
    textDiv.style.top = "50%";
    textDiv.style.left = "50%";
    textDiv.style.marginRight = "-50%";
    textDiv.style.transform = "translate(-50%, -50%)";
    textDiv.style.backgroundColor = "rgba(255, 255, 255, 1)";
    textDiv.style.fontFamily = "'Roboto', Sans Serif";
    textDiv.style.color = "rgba(0, 0, 0, 1)"; //TODO: set automatically based on tint shade
    textDiv.style.fontSize = "80px"; //TODO: self adjusting size. rn, just set a cap
    textDiv.style.zIndex = 100;
    textDiv.style.opacity = 0;

    document.documentElement.appendChild(tintDiv);
    tintDiv.appendChild(textDiv);
    }
}
	//Creates an empty text wrapper, allowing innerHTML to be added
	function setupText() {

    }