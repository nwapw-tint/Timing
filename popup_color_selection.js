var colorWheelImg;
var colorWheelData;

//Returns the color found in the image at the coordinate (x, y)
function getColorFromWheel (x, y) {
	if (x < 0 || x >= colorWheelImg.width || y < 0 || y >= colorWheelImg.height)
		return null;
	let index = (y * colorWheelImg.width + x) * 4; //*4 because each color is 4 elements (r, g, b, and a)
	if (colorWheelData.data[index + 3] < 255)
		return null;
	return "rgba(" + colorWheelData.data[index] + "," + colorWheelData.data[index + 1] + "," + colorWheelData.data[index + 2] + ", " + alpha + ")";
}
