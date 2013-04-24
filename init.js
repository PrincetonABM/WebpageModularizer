var clicked = false;
chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("NOTE: Injecting Scripts");
	// inject the custom CSS to be used with the jquery UI library
	chrome.tabs.insertCSS(null, {file: "jquery-ui.custom/css/pepper-grinder/jquery-ui-1.10.2.custom.min.css"});
	// inject jquery, jquery UI libraries and the Modulr script
	chrome.tabs.executeScript(null, { file: "jquery-1.9.1.min.js" }, function() {
   	 	chrome.tabs.executeScript(null, { file: "jquery-ui.custom/js/jquery-ui-1.10.2.custom.min.js" }, function() {
			chrome.tabs.executeScript(null, { file: "Modulr.js" });
		});
	});
});