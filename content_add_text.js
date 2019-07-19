duration = 1400;
step = 200;

var robotoFont = document.createElement('link');
robotoFont.setAttribute('rel', 'stylesheet');
robotoFont.setAttribute('type', 'text/css');
robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");

function addText(text, time)
{
    addRoboto();
    textDiv = document.getElementById("textDiv")
    if (textDiv && textDiv.style.opacity == 0) {    
        textDiv.style.opacity = 1;
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
                fadeTarget.style.opacity -= step / duration;
            else {
                clearInterval(fadeEffect);
                fadeTarget.style.opacity = 0;
            }
        }, step);
    }
}

function addRoboto() {
    var robotoFont = document.createElement('link');
    robotoFont.setAttribute('rel', 'stylesheet');
    robotoFont.setAttribute('type', 'text/css');
    robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
    document.documentElement.append(robotoFont);
}
