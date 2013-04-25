$(document).ready(function() {
	$("#addURLBtn").click(function() {
		var text = $('textarea').val();
		console.log(text);
		var URLTok = text.split(',');
		
		var URLkey = "urls_Modulr";
		
		for (var i = 0; i < URLTok.length; i++) {
			//add each url to local storage
			
		}
		
	});
});
