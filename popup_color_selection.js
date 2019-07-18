var colorWheelImg;
var colorWheelData;

function getColorFromWheel(x, y) {
	if (x < 0 || x >= colorWheelImg.width || y < 0 || y >= colorWheelImg.height)
		return null;
	let index = (y * colorWheelImg.width + x) * 4;
	if (colorWheelData.data[index + 3] < 255)
		return null;
		//TODO: rewrite as rgba(r,g,b,a);
	return {
		"r": colorWheelData.data[index],
		"g": colorWheelData.data[index + 1],
		"b": colorWheelData.data[index + 2],
		"a": 100
	};
}
