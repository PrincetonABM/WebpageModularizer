chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var url = sender.tab.url;
	var keyAttr = 'Modulr_module_attributes_' + url;
	var keySplit = 'Modulr_module_splits_' + url;

	if (request.command == "load") {
		if (!( keyAttr in localStorage) || !( keySplit in localStorage)) {
			sendResponse({
				success : false
			});
			return;
		}
		console.log("wtf");
		sendResponse({
			attributes : localStorage[keyAttr],
			split : localStorage[keySplit],
			success : true
		});
	}

	if (request.command == "save") {
		localStorage[keyAttr] = request.attributes;
		localStorage[keySplit] = request.split;
	}

	console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
}); 