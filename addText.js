//displays the text
text = "English HW 3:27";
addText(text);
function addText(text)
{
    textDiv = document.getElementById("textDiv")
    if(textDiv != null)
    {
    textDiv.innerHTML = text;
    textDiv.style.opacity = 1;
    setTimeout(function(){textDiv.innerHTML = "";},2000);
    }
    else {console.log("the user tried to display the time but there is no filter active currently");}
}
