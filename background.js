chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var url = sender.tab.url;
	var keyAttr = 'Modulr_module_attributes_' + url;
	var keySplit = 'Modulr_module_splits_' + url;
        var keyTags = 'Modulr_module_tags_' + url;

	if (request.command == "load") {
                var pattAttr = new RegExp("Modulr_module_attributes_" + url.match(/.+\.(com|org|net|edu|gov|mil|cc|info|biz)/)[0]);
		if (( keyAttr in localStorage) && ( keySplit in localStorage) && ( keyTags in localStorage )) {
                    sendResponse({
                            attributes : localStorage[keyAttr],
                            split : localStorage[keySplit],
                            tags : localStorage[keyTags],
                            exact : true,
                            success : true
                    });
                }
                else {
                    var keys = Object.keys(localStorage);
                    for (var i = keys.length - 1; i >= 0; i--) {
                        if (keys[i].search(pattAttr) !== -1){
                            url = keys[i].substring(25);
                            var keyAttr = 'Modulr_module_attributes_' + url;
                            var keySplit = 'Modulr_module_splits_' + url;
                            var keyTags = 'Modulr_module_tags_' + url;
                            sendResponse({
                                    attributes : localStorage[keyAttr],
                                    split : localStorage[keySplit],
                                    tags : localStorage[keyTags],
                                    exact : false,
                                    success : true
                            });
                            
                            return;
                        }
                    }
                    sendResponse({
				success : false
			});
			return;
                }
	}

	if (request.command == "save") {
		localStorage[keyAttr] = request.attributes;
		localStorage[keySplit] = request.split;
                localStorage[keyTags] = request.tags;
	}

	console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
}); 