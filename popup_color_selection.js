var colorWheelImg;
var colorWheelData;

function getColorFromWheel(x, y) {
	if (x < 0 || x >= colorWheelImg.width || y < 0 || y >= colorWheelImg.height)
		return null;
	let index = (y * colorWheelImg.width + x) * 4;
	if (colorWheelData.data[index + 3] < 255)
		return null;
	return "rgba(" + colorWheelData.data[index] + "," + colorWheelData.data[index + 1] + "," + colorWheelData.data[index + 2] + ", " + alpha + ")"
}
