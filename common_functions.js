function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	let str = "";
	if (h < 10 && h > 0)
		str += "0";
	if (h > 0)
		str += h + ":";
	if (m < 10 && (m > 0 || h >= 0))
		str += "0";
	if (m > 0 || h >= 0)
		str += m + ":";
	if (s < 10)
		str += "0";
	return str + s;
}
var robotoFont = document.createElement('link');
robotoFont.setAttribute('rel', 'stylesheet');
robotoFont.setAttribute('type', 'text/css');
robotoFont.setAttribute('href', "https://fonts.googleapis.com/css?family=Roboto&display=swap");
