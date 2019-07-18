/*function rgbToHex(color) {
	return "#" + byteToHex(color.r) + byteToHex(color.g) + byteToHex(color.b);
	function byteToHex(c) {
		let hex = Number(c).toString(16);
		if (hex.length < 2)
			hex = "0" + hex;
		return hex;
	}
}*/ //please use RGBA formatting from now on.
//takes an integer amount of time (seconds) and converts it into human readable string format
function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	let str = "";
	if(h!= 0)
	{
		if (h < 10)
			str += "0";
		str += h + ":";
	}
	if (m < 10)
		str += "0";
	str += m + ":";
	if (s < 10)
		str += "0";
	return str + s;
}

//roboto font
var robotoFont = document.createElement('link');
robotoFont.setAttribute('rel', 'stylesheet');
robotoFont.setAttribute('type', 'text/css');
robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
