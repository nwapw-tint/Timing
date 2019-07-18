name = "tint-"+"colorName"
color = "rgba(0,0,0,0.8)";
duration = 100;
text = "English HW 3:27";

if(document.querySelector('[id^="tint-"]') == null)
{
    console.log("no existing filter found, adding another");
    var doc = document.documentElement;//running at document_start means there is no head or body
    var tintDiv = document.createElement("div");
    var textDiv = document.createElement("div");
    var robotoFont = document.createElement('link');
    robotoFont.setAttribute('rel', 'stylesheet');
    robotoFont.setAttribute('type', 'text/css');
    robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
    doc.appendChild(robotoFont); 
    tintDiv.id = name; //allows removal by id
    tintDiv.style.background = color;
    doc.style.height = "100%";
    doc.style.margin = 0;
    doc.style.padding = 0;
    doc.appendChild(tintDiv);
    tintDiv.appendChild(textDiv);
    styleTint(tintDiv);
    styleText(text);
    setTimeout(function (){
        var overlay = document.getElementById(name); //removes the specified filter by id
        overlay.parentNode.removeChild(overlay);
        },duration*1000);

}else{console.log("An existing filter was found.")}
function styleText(text)
{
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
    textDiv.innerHTML = "read pg. 64, 65";
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
