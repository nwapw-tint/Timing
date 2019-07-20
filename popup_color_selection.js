var colorImg;
var colorData;

//Returns the color found in the image at the coordinate (x, y)
function getColorFrom (x, y) {
	if (x < 0 || x >= Math.floor(colorImg.width / 4) || y < 0 || y >= Math.floor(colorImg.height / 4))
		return null;
	let index = (y * colorImg.width + x) * 4; //*4 because each color is 4 elements (r, g, b, and a)
	if (colorData.data[index + 3] < 255)
		return null;
	return "rgba(" + colorData.data[index] + "," + colorData.data[index + 1] + "," + colorData.data[index + 2] + ", " + alpha + ")";
}
