//displays the text
var port = chrome.extension.connect({
	name: "addText"
});
//sendMessage
function sendMessage(msg) {
	port.postMessage(msg);
}
//Tells the background script the addText script has opened
sendMessage({
	to: "background",
	from: "addText",
	action: "open"
});
alert("addText open");
//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	if (msg.to == "addText") {
        console.log(msg);
        if(msg.action == "addText"){
            addText(msg.text);
        }
	}
});
function addText(text)
{
    alert("addingText")
    textDiv = document.getElementById("textDiv")
    if(textDiv != null)
    {
    textDiv.innerHTML = text;
    textDiv.style.opacity = 1;
    setTimeout(function(){textDiv.innerHTML = "";},2000);
    }
    else {console.log("the user tried to display the time but there is no filter active currently");}
}
