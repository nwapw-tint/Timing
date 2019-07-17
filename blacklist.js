function banned(id){
	var site = document.getElementById(id).value;
	
	var host = window.location.host;
	document.getElementById(id).value = '';
	for (var i = 0; i < blacklist.length; i++) {
	  if (host === site) {
		console.log("Banned!");
		break;
	  } else {
		console.log("Safe!");
	  }
	}
}