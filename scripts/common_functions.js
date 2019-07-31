//Converts a number in seconds to digital time
function timeToDigital(seconds) {
	let h = Math.floor(seconds / 3600);
	let m = Math.floor((seconds / 60) % 60);
	let s = Math.floor(seconds % 60);
	let str = "";
	if (h < 10 && h > 0) {
		str += "0";
	}
	if (h > 0) {
		str += h + ":";
	}
	if (m < 10 && (m > 0 || h >= 0)) {
		str += "0";
	}
	if (m > 0 || h >= 0) {
		str += m + ":";
	}
	if (s < 10) {
		str += "0";
	}
	return str + s;
}

//Gets the width of a string in pixels
function stringWidth(text, fontName, fontSize) {
	if (stringWidth.canvas === undefined) {
		stringWidth.canvas = document.createElement('canvas');
		stringWidth.context = stringWidth.canvas.getContext('2d');
	}
	stringWidth.context.font = fontSize + " " + fontName;
	return Math.ceil(stringWidth.context.measureText(text).width);
}

//Takes a string with rgba() and takes off the alpha
function rgbaToRgb(rgba) {
	return "rgb" + rgba.substring(rgba.indexOf('('), rgba.lastIndexOf(',')) + ')';
}

//Takes a string in hex and converts it to rgba
function hexToRgba(hex) {
	return "rgba(" + parseInt(hex.substring(1, 3), 16) + "," + parseInt(hex.substring(3, 5), 16) + "," + parseInt(hex.substring(5, 7), 16) + "," + alpha + ")";
}

//Gets the property of the element
function getPropertyFromElement(element, property) {
	return window.getComputedStyle(element, null).getPropertyValue(property);
}

const alpha = 0.4;

const CLEAR_COLOR = "rgba(0,0,0,0)"
const fadeDuration = 700;
const fadeStep = 10;
const MAX_Z_VALUE = 2147483647;

