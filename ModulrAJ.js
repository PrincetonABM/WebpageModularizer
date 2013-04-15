var Modularizer = {
	// Tags that should be divided by
	SplitTags : ["MAP", "ARTICLE", "CANVAS", "DIV", "FIGURE", "FOOTER", "HEADER", "IMG", "P", "SECTION", "SPAN", "OL", "UL"],
	//Tags that affect text font that should not be divided by
	DescriptiveTags : ["FONT", "B", "I", "STRONG", "EM", "SUB", "SUP", "CODE"],
	//Tags that must not be contained within modules
	ExcludedTags : ["SCRIPT"],
	//the maximum single branch length for a module
	MAX_BRANCH_LEN : 5,
	// min pixel area for a module
	MIN_AREA : 1,
	// max pixel area for a module
	MAX_AREA : 150000,
	// Minimum fraction of same tags required to form a group
	GROUP_THRESHOLD : .8,
	MIN_TEXT_LENGTH: 10,

	getBaseElements : function(tag) {
		var bases = new Array();
		var allTags = $(tag);
		for (var i = 0; i < allTags.length; i++) {
			if (allTags.eq(i).find(tag).length === 0)
				bases.push(allTags.eq(i).get(0));
		}
		return bases;
	},

	fillBlacklist : function(tagString, elem, blacklist) {
		blacklist.push(elem);
		$(elem).parents().each(function() {
			var currentParent = $(this).get(0);
			if ($.inArray(currentParent, blacklist) == -1) {
				blacklist.push(currentParent);
			}
		});

		$(elem).find(tagString).each(function() {
			var currentChild = $(this).get(0);
			if ($.inArray(currentChild, blacklist) == -1) {
				blacklist.push(currentChild);
			}
		});

		console.log("the black list is now: ");
		this.printArray(blacklist);
	},
	getArea : function(elem) {
		return $(elem).height() * $(elem).width();
	},
	modularize : function(doc) {
		// modules is a array that stores elements as DOM elements rather than jquery elements because jquery elements of the same DOM
		//element are different instances so they are not equal
		var modules = new Array();
		//elements in the blacklist cannot be modularized
		var blacklist = new Array();

		// Create a String which is the selector for all the split tags
		var tagString = this.SplitTags[0];
		for (var i = 1; i < this.SplitTags.length; i++)
			tagString += ", " + this.SplitTags[i];
		// Get the base elements which are split tags
		var allBases = this.getBaseElements(tagString);

		console.log("initial bases: ");
		this.printArray(allBases);
		// Group the elements into modules
		while (allBases.length > 0) {
			var current = allBases.shift();

			if ($.inArray(current, modules) > -1)
				continue;
			if ($.inArray(current, blacklist) > -1)
				continue;

			
/*

			var numParents = $(current).parents().length;
			
			for (var i = 0; i < allBases.length; i++) {
				if ($(allBases[i]).parents().length > numParents) {
					allBases.push(current);
					current = allBases[i];
					break;
				}
			}

			console.log("NUM PARENTS @@@@@@@@@@@@@@: " + numParents);*/

			
			// Only consider the elements which have some text or is an image
			if ($(current).text().trim().length == 0 && $(current).find('img').length === 0)
				continue;
			
			var siblings = $(current).siblings(tagString);
			// If current has siblings
			if (siblings.length > 0) {
				// Find the number of siblings which have the same tag as current
				var sameTagged = 0;
				for (var i = 0; i < siblings.length; i++) {
					if (siblings.eq(i).prop('tagName') === $(current).prop('tagName')) {
						sameTagged++;
					}
				}

				// If the fraction is below the grouping threshold make current and all of its siblings modules
				if (((sameTagged / siblings.length) < this.GROUP_THRESHOLD) && ($(current).height() * $(current).width() > this.MIN_AREA)) {

					if (this.getArea(current) < 1)
						continue;

					console.log("current is adding:");
					console.log(current);
					modules.push(current);
					this.fillBlacklist(tagString, current, blacklist);

					siblings.each(function() {
						var sibling = $(this).get(0);

						if ($.inArray(sibling, blacklist) > -1 || $.inArray(sibling, modules) > -1) {
							return;
						}

						if (Modularizer.getArea(sibling) < 1)
							return;

						console.log("and siblings adding:");
						console.log(sibling);
						modules.push(sibling);

						Modularizer.fillBlacklist(tagString, sibling, blacklist);
					});
				}
				
				// Otherwise add the parent as a module if its area is above the maximum allowed area
				// or add the parent back to the elements being considered by the loop
				else {
					console.log("adding parent back!");
					if ($.inArray(current.tagName, this.SplitTags) > 0)
						allBases.push($(current).parent().get(0));
				}
			}
			// If current has no siblings
			else {
				console.log("no siblings");

				if ($(current).parents().length < 2) {
					if ($.inArray(current, blacklist) == -1 && $.inArray(current, modules) == -1 && this.getArea(current) >= 1) {
						modules.push(current);
						Modularizer.fillBlacklist(tagString, current, blacklist);
					}
					console.log("modules length: " + modules.length);

				} else {
					if ($.inArray(current.tagName, this.SplitTags) > 0)
						allBases.push($(current).parent().get(0));
				}
			}
		}
		console.log("blacklist: ");
		this.printArray(blacklist);
		return modules;
	},
	printArray : function(arr) {
		console.log("array is: ");
		for (var i = 0; i < arr.length; i++) {
			console.log(arr[i]);
		}
	},
	//combines moduleA and moduleB into one jquery module
	merge : function(moduleA, moduleB) {
		return moduleA.add(moduleB);
	},

	shouldGroup : function(element) {

	}
};