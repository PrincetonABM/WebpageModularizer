var key1 = 'Modulr_module_attributes_';
var key2 = 'Modulr_module_splits_';
var MAX_URL_LEN = 100;

function addTableEntry(storageKey1, storageKey2, url) {
	var table = $(".table").find('tbody');
	var tEntry = $('<tr><td>' + url + '</td><td><a role="button" data-toggle="modal"><i class="icon-remove"></i></a></td></tr>');
	var deleteButton = tEntry.find('a');
	deleteButton.click(function() {
		localStorage.removeItem(storageKey1);
		localStorage.removeItem(storageKey2);
		tEntry.remove();
	});
	table.append(tEntry);
}

function deleteAll() {
	var table = $(".table").find('tbody');
	table.empty();
	
	
	for (var i = 0; i < localStorage.length; i++) {
		var key = localStorage.key(i);
		if (key.indexOf(key1) != -1) {
			localStorage.removeItem(key);
			i--;
		}
		else if (key.indexOf(key2) != -1) {
			localStorage.removeItem(key);
			i--;
		}
	}
}


$(document).ready(function() {
	console.log("local storage size: " + localStorage.length);
	for (var i = 0; i < localStorage.length; i++) {

		var key = localStorage.key(i);
		var url = null;
		if (key.indexOf(key1) == -1) {
			continue;
		}
		if (key.indexOf(key1) != -1) {
			url = key.substr(key1.length);
		}
		urlText = url;
		if (url.length > MAX_URL_LEN) {
			urlText = url.substring(0,MAX_URL_LEN) + "...";
		}
		addTableEntry(key1 + url, key2 + url, urlText);
	}

	$('#deleteBtn').click(function() {
		deleteAll();
	});

});

console.log(document);

