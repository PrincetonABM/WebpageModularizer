var Cleaner = {
	clean : function(doc) {
		$("script").remove();
		$("meta").remove();
	}
};

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
	MIN_AREA : 5000,
	// max pixel area for a module
	MAX_AREA : 15000,
	// Minimum fraction of same tags required to form a group
	GROUP_THRESHOLD : .8,

	getBaseElements : function(tag) {
		var bases = $();
		var allTag = $(tag);
		for (var i = 0; i < allTag.length; i++) {
			if (allTag.eq(i).find(tag).length === 0)
				bases = bases.add(allTag.eq(i));
		}
		return bases;
	},
	/*
	 partition : function(array, begin, end, pivot, tagString)
	 {
	 var piv=array[pivot];
	 array.swap(pivot, end-1);
	 var store=begin;
	 var ix;
	 for(ix=begin; ix<end-1; ++ix) {
	 if(array[ix].find(tagString).length <= piv.find(tagString).length) {
	 array.swap(store, ix);
	 ++store;
	 }
	 }
	 array.swap(end-1, store);

	 return store;
	 },
	 sort : function(array, tagString)
	 {
	 this.qsort(array, 0, array.length);
	 },
	 qsort : function(array, begin, end)
	 {
	 if(end-1>begin) {
	 var pivot=begin+Math.floor(Math.random()*(end-begin));

	 pivot=this.partition(array, begin, end, pivot);

	 this.qsort(array, begin, pivot);
	 this.qsort(array, pivot+1, end);
	 }
	 },*/

	modularize : function(doc) {
		// modules is a jQuery object which will eventually contain the elements which are modules
		var modules = $();
		var tagString = this.SplitTags[0];
		// Create a String which is the selector for all the split tags
		for (var i = 1; i < this.SplitTags.length; i++)
			tagString += ", " + this.SplitTags[i];
		// Get the base elements which are split tags
		var allBases = this.getBaseElements(tagString);

		// Group the elements into modules
		while (allBases.length !== 0) {
			var current = allBases.eq(0);
			allBases = allBases.not(current);
			/*
			if (allBases.find(current).length > 0){
			continue;
			}*/

			// Continue if current is a descendant of any member of allBases
			if (allBases.find(current).length !== 0)
				continue;

			// Only consider the elements which take up space on the page
			if (current.height() * current.width() === 0 || (current.text() === "" && current.find('img').length === 0))
				continue;

			var siblings = current.siblings(tagString);

			// If current has siblings
			if (siblings.length > 0) {
				/* if (siblings.find(allBases.not(siblings)))
				continue;*/

				// Find the number of siblings which have the same tag as current
				var sameTagged = 0;
				for (var i = 0; i < siblings.length; i++) {
					if (siblings.eq(i).prop('tagName') === current.prop('tagName')) {
						sameTagged++;
					}
				}

				// If the fraction is below the grouping threshold make current and all its siblings modules
				if (sameTagged / siblings.length < this.GROUP_THRESHOLD && current.width() * current.height() > this.MIN_AREA) {
					modules = modules.add(current);
					modules = modules.add(siblings);
				}

				// Otherwise add the parent as a module if its area is above the maximum allowed area
				// or add the parent back to the elements being considered by the loop
				else {
					if (current.parent().width() * current.parent().height() > this.MAX_AREA) {
						modules = modules.add(current.parent());
					} else {
						allBases = allBases.add(current.parent());
					}
				}

				// Remove the siblings from allBases
				allBases = allBases.not(siblings);
				allBases = allBases.not(siblings.find(tagString));
			}

			// If current has no siblings
			else {
				if (current.parent().prop('tagName').toLowerCase() === 'body')
					modules = modules.add(current);
				else {
					if (current.parent().width() * current.parent().height() > this.MAX_AREA) {
						modules = modules.add(current.parent());
					} else {
						allBases = allBases.add(current.parent());
					}
				}
			}
		}
		return modules;
	},

	shouldGroup : function(element) {

	}
};
/**
 * Takes wrapped up modules and adds UI features to the modules to allow for customizability
 *
 * Input: A document with modules wrapped in tags with a unique identifier (with a class, id, name...)
 * Output: UI customizability features added to these modules
 */
var Modulr = {
	//create and return the buttons
	createButtons : function(module) {
		var buttons = new Array();
		var openModule = true, isDraggable = false, isResizable = false, isIsolated = false;
		//initial font size (100%)
		var fontSize = 100;
		var spacing = 0;
		/******* create the buttons **********/
		var closeButton = $('<input/>').attr({
			value : 'X',
			class : 'moduleBtn'
		}).button().click(function() {
			if (openModule) {
				module.css('visibility', 'hidden');
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i] != closeButton)
						buttons[i].css('visibility', 'hidden');
				}
				closeButton.button("option", "label", "!");
			} else {

				for (var i = 0; i < buttons.length; i++) {
					buttons[i].css('visibility', 'visible');
				}

				module.css('visibility', 'visible');
				closeButton.button("option", "label", "X");
			}
			openModule = !openModule;
		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});

		spacing += closeButton.outerWidth();
		var dragButton = $('<input/>').attr({
			value : 'D',
			class : 'moduleBtn'
		}).button().click(function() {
			module.draggable({
				snap : true
			});
			if (!isDraggable) {
				module.draggable("enable");
			} else {
				module.draggable("disable");
			}
			isDraggable = !isDraggable;

		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});

		spacing += dragButton.outerWidth();
		/*
		 var resizeButton = $('<input/>').attr({
		 value : 'R'
		 }).button().click(function() {
		 module.resizable();
		 if (!isResizable) {
		 module.resizable("enable");
		 } else {
		 module.resizable("disable");
		 }
		 isResizable = !isResizable;
		 }).css({
		 position : 'absolute',
		 left : module.position().left + spacing,
		 top : module.position().top,
		 'font-size' : '10px',
		 width : '2%',
		 visibility : 'hidden'
		 });

		 //all children of the module need to inherit this font size
		 spacing += resizeButton.outerWidth();*/

		module.find('*').css("font-size", "inherit");
		var sizeUpButton = $('<input/>').attr({
			value : '^',
			class : 'moduleBtn'
		}).button().click(function() {
			fontSize += 25;
			module.css("font-size", fontSize + "%");

		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});

		spacing += sizeUpButton.outerWidth();
		var sizeDownButton = $('<input/>').attr({
			value : 'v',
			class : 'moduleBtn'
		}).button().click(function() {
			fontSize -= 25;
			module.css("font-size", fontSize + "%");
		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});
		spacing += sizeDownButton.outerWidth();
		var isolateButton = $('<input/>').attr({
			value : 'I',
			class : 'moduleBtn'
		}).button().click(function() {

			if (!isIsolated) {
				$('*').not(module.parents()).not(module.find('*')).not(module).not(".moduleBtn").css({
					opacity : "0.5",
				});
			} else {
				$('*').css({
					opacity : "1.0",
				});
			}
			isIsolated = !isIsolated;

		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});
		/*
		 spacing += sizeDownButton.outerWidth();
		 var fontColorButton = $('<input/>').attr({
		 value : 'C'
		 }).button().click(function() {
		 var colorPicker = $('<input type="text" id="custom" />');
		 colorPicker.spectrum({
		 color : "yellow"
		 });
		 fontColorButton.append(colorPicker);
		 }).css({
		 position : 'absolute',
		 left : module.position().left + spacing,
		 top : module.position().top,
		 'font-size' : '10px',
		 width : '2%',
		 visibility : 'hidden'
		 });
		 */

		buttons.push(closeButton);
		buttons.push(dragButton);
		/*	buttons.push(resizeButton);*/
		buttons.push(sizeUpButton);
		buttons.push(sizeDownButton);
		buttons.push(isolateButton);
		/*buttons.push(fontColorButton);*/
		/*****************************/

		return buttons;
	},

	modularize : function(doc) {
		$('.module').each(function() {
			var module = $(this);
			var showButtons = false;
			var buttons = Modulr.createButtons(module);

			for (var i = 0; i < buttons.length; i++) {
				module.after(buttons[i]);
			}

			module.on({
				click : function() {
					if (!showButtons) {
						for (var i = 0; i < buttons.length; i++) {
							var button = buttons[i];
							button.css({
								visibility : 'visible'
							});
						}
					} else {
						for (var i = 0; i < buttons.length; i++) {
							var button = buttons[i];
							button.css({
								visibility : 'hidden'
							});
						}
					}
					showButtons = !showButtons;
					//reset the positions of the buttons
					var spacing = 0;
					for (var i = 0; i < buttons.length; i++) {
						var button = buttons[i];
						button.css({
							position : 'absolute',
							left : module.position().left + spacing,
							top : module.position().top
						});
						spacing += button.outerWidth();
					}

				},
				mouseenter : function() {
					module.css({
						outline : "dashed 3px green",
					});
				},
				mouseleave : function() {
					module.css("outline", "0px");
				}
			});
		});

	},

	process : function(doc) {
		var modules = Modularizer.modularize(document);
		for (var i = 0; i < modules.length; i++) {
			module = $(modules[i]);
			module.wrap('<div class="module" />');
		}
		Modulr.modularize(document);
	}
};

$(document).ready(function() {
	Modulr.process(document);
});

