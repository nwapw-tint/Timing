//displays the text
text = "English HW 3:27";
addText(text);
function addText(text)
{
    textDiv = document.getElementById("textDiv")
    textDiv.innerHTML = text;
    textDiv.style.opacity = 1;
    setTimeout(function(){textDiv.innerHTML = "";},2000);
}
