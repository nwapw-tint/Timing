function addText(text)
{
    textDiv = document.getElementById("textDiv")
    if (textDiv) {
        textDiv.innerHTML = text;
        textDiv.style.opacity = 1;
        setTimeout(() => {
            textDiv.innerHTML = "";
        }, 2000);
    } else {
        alert("the user tried to display the time but there is no filter active currently");
    }
}
