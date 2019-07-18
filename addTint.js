name = "tint-"+"colorName"
color = "rgba(0,0,0,0.2)";
duration = 100;

if(document.querySelector('[id^="tint-"]') == null)
{
    console.log("no existing filter found, adding another");
    var doc = document.documentElement;//running at document_start means there is no head or body
    var tintDiv = document.createElement("div");
    tintDiv.id = name; //allows removal by id
    tintDiv.style.background = color;

    var robotoFont = document.createElement('link');
    robotoFont.setAttribute('rel', 'stylesheet');
    robotoFont.setAttribute('type', 'text/css');
    robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");

    doc.appendChild(robotoFont); 
    doc.style.height = "100%";
    doc.style.margin = 0;
    doc.style.padding = 0;
    doc.appendChild(tintDiv);
    styleTint(tintDiv);
    setupText();
    setTimeout(function (){
        var overlay = document.getElementById(name); //removes the specified filter by id
        overlay.parentNode.removeChild(overlay);
        },duration*1000);

}else{console.log("An existing filter was found.")}
function setupText()
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
