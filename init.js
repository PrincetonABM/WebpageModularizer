function getDomain(url) {
	var domain = url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
	return domain;
}

function injectScript() {
	console.log("NOTE: Injecting Scripts");
	// inject the custom CSS to be used with the jquery UI library
	chrome.tabs.insertCSS(null, {
		file : "jquery-ui.custom/css/pepper-grinder/jquery-ui-1.10.2.custom.css"
	});
	//inject css to be used with the modulr program
	chrome.tabs.insertCSS(null, {
		file : "ModulrStyle.css"
	});
	// inject jquery, jquery UI libraries and the Modulr script
	chrome.tabs.executeScript(null, {
		file : "jquery-1.9.1.min.js"
	}, function() {
		chrome.tabs.executeScript(null, {
			file : "jquery-ui.custom/js/jquery-ui-1.10.2.custom.min.js"
		}, function() {
			chrome.tabs.executeScript(null, {
				file : "jquery.tabSlideOut.js"
			}, function() {
				chrome.tabs.executeScript(null, {
					file : "Modulr.js"
				});
			});
		});
	});
}

chrome.browserAction.onClicked.addListener(function(tab) {
	injectScript();
});

var URL_KEY = "urls_Modulr";
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log(tabId);
	console.log(changeInfo);
	if (changeInfo.status != "complete") {
		return;
	}
	
	var domains = JSON.parse(localStorage[URL_KEY]);
	var curDomain = getDomain(tab.url);
	console.log(curDomain);
	if (domains.indexOf(curDomain) > -1) {
		injectScript();
	}
});

