duration = 1400;
step = 200;
function addText(text,time)
{
    textDiv = document.getElementById("textDiv")
    if (textDiv && textDiv.style.opacity == 0) {        
        textDiv.style.fontFamily = "'Roboto', Sans Serif";
        textDiv.style.opacity = 1;
        textDiv.style.display = "inline";
        textDiv.innerHTML = text+" "+timeToDigital(time);
        fadeOut(textDiv);
        setTimeout(function(){textDiv.innerHTML = text+" "+timeToDigital(time-1)},1000);
        //revert back to no display default
    } else {
        //alert("the user tried to display the time but there is no filter active currently");
    }
    function fadeOut(fadeTarget) {
        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0.001) {
                fadeTarget.style.opacity-= (step/duration);
            } else {
                clearInterval(fadeEffect);
                fadeTarget.style.opacity = 0;
            }
        }, step);
    }
    
}
