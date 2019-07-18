var messageDelay = 1000; //one second per frame
function addText(text)
{
    textDiv = document.getElementById("textDiv")
    if (textDiv) {
        textDiv.innerHTML = text;
    setTimeout(function(){
        textDiv.innerHTML = "";
    },1200)
    } else {
        //alert("the user tried to display the time but there is no filter active currently");
    }
}
