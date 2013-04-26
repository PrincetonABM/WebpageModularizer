var URL_KEY = "urls_Modulr";

function addTableEntry(url) {
	var table = $(".table").find('tbody');
	var tEntry = $('<tr><td>' + url + '</td><td><a role="button" data-toggle="modal"><i class="icon-remove"></i></a></td></tr>');
	var deleteButton = tEntry.find('a');
	deleteButton.click(function() {
		//add more
		tEntry.remove();
		var URLs = JSON.parse(localStorage[URL_KEY]);
		var i = URLs.indexOf(url);
		if (i > -1) {
			URLs.splice(i, 1);
		}
		localStorage[URL_KEY] = JSON.stringify(URLs);
	});
	table.append(tEntry);
}

function fillTable() {
	//first clear all entries
	var table = $(".table").find('tbody');
	table.empty();
	
	if (localStorage[URL_KEY] == null || localStorage[URL_KEY].length == 0) {
		return;
	}
	
	var URLs = JSON.parse(localStorage[URL_KEY]);
	for (var i = 0; i < URLs.length; i++) {
		addTableEntry(URLs[i]);
	}
}
function getDomain(url) {
	var domain = url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
	return domain;
}
function deleteAll() {
	//first clear all entries
	var table = $(".table").find('tbody');
	table.empty();
	if (localStorage[URL_KEY] == null || localStorage[URL_KEY].length == 0) {
		return;
	}
	var URLs = JSON.parse(localStorage[URL_KEY]);
	URLs = new Array();
	localStorage[URL_KEY] = JSON.stringify(URLs);
}

$(document).ready(function() {
	
	fillTable();
	$('#deleteBtn').click(function() {
		deleteAll();
	});
	
	$('#addURL').click(function() {
		$('textarea').val("");
	});
	
	$("#addURLBtn").click(function() {
		var text = $('textarea').val();
		console.log(text);
		var URLTok = text.split(',');
		
		
		if (localStorage[URL_KEY] == null || localStorage[URL_KEY].length == 0) {
			var tempURLs = new Array();
			localStorage[URL_KEY] = JSON.stringify(tempURLs);
		}
		
		var URLs = JSON.parse(localStorage[URL_KEY]);
		
		for (var i = 0; i < URLTok.length; i++) {
			if (URLTok[i].trim().length == 0) {
				continue;
			}
			
			var domain = getDomain(URLTok[i]);
			if (domain.indexOf('.') == -1) {
				continue;
			}
			if (URLs.indexOf(domain) > -1 || URLs.indexOf(domain.trim()) > -1) {
				continue;
			}
			URLs.push(domain);	
		}
		localStorage[URL_KEY] = JSON.stringify(URLs)
		fillTable();
		
	});
});
