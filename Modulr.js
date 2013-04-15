// right now there is a lot of code that is not used because i've been testing a lot of different modularizing techniques

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
	ExcludedTags : ["SCRIPT", "IFRAME"],
	ExcludedString : "script, iframe",
	//the maximum single branch length for a module
	MAX_BRANCH_LEN : 5,
	// min pixel area for a module
	MIN_AREA : 1,
	// max pixel area for a module
	MAX_AREA : screen.height * screen.width * 0.8,
	MAX_AVG_AREA: screen.height * screen.width * 0.1,
	// Minimum fraction of same tags required to form a group
	GROUP_THRESHOLD : .8,
	MIN_TEXT_LENGTH : 10,
	MAX_BRANCHING_FACTOR : 4,

	getArea : function(elem) {
		return $(elem).height() * $(elem).width();
	},
	
	//return the average branching factor of the element and its children
	getAverageBF : function(elem) {
		var totBranches = 0;
		var totElems = 0;

		var elements = new Array();
		elements.push(elem);
		while (elements.length > 0) {
			var e = elements.shift();
			if ($(e).children().length == 0)
				continue;

			totElems++;
			totBranches += $(e).children().length;
			$(e).children().each(function() {
				elements.push($(this)[0]);
			});
		}
		return totBranches / totElems;
	},

	getAvgElementSize : function(elements) {
		var totSize = 0;
		for (var i = 0; i < elements.length; i++) {
			totSize += this.getArea(elements[i]);
		}
		return totSize / elements.length;
	},
	getLargestElementSize : function(elements) {
		var largestArea = 0;
		for (var i = 0; i < elements.length; i++) {
			if (this.getArea(elements[i]) > largestArea) {
				largestArea = this.getArea(elements[i]);
			}
		}
		return largestArea;
	},
	modularize : function(doc) {
		var modules = new Array();
		var elements = new Array();
		var body = doc.getElementsByTagName("html")[0].children[1];
		var level = 0;
		var elementsA = new Array();
		var elementsB = new Array();
		elementsA.push(body);
		var cur = "A";
		var source = elementsA;
		var target = elementsB;

		do {

			while (source.length > 0) {
				var curElem = source.shift();

				if ($(curElem).children().length == 0) {
					target.push(curElem);
				}

				$(curElem).children().each(function() {
					target.push($(this)[0]);
				});
			}

			if (this.getAvgElementSize(target) < this.MAX_AVG_AREA && this.getLargestElementSize(target) < this.MAX_AREA) {
				console.log("max area: " + this.MAX_AREA);
				console.log("area: " + this.getAvgElementSize(target));
				break;
			}

			cur = (cur == 'A') ? 'B' : 'A';
			source = (cur == 'A') ? elementsA : elementsB;
			target = (cur == 'A') ? elementsB : elementsA;
		} while (elementsA.length > 0 || elementsB.length > 0);

		console.log(this.getAvgElementSize(target));
		modules = this.processModules(target);
		
	

		console.log("there are modules: " + modules.length);

		for (var i = 0; i < modules.length; i++) {
			var module = $(modules[i]);
			console.log("AREA: " + module.width() * module.height());
			console.log(modules[i]);
			module.wrap('<div class="module_Modulr" />');
		}

	},
	
	isModuleValid : function(module) {
		if (this.getArea(module) < this.MIN_AREA)
			return false;
		return true;
	},
	printArray : function(arr) {
		console.log("array is: ");
		for (var i = 0; i < arr.length; i++) {
			console.log(arr[i]);
		}
	},

	processModules : function(modules) {
		var newModules = new Array();
		while (modules.length > 0) {
			var module = modules.shift();
			var combinedModule = module;
			if ($.inArray(module.tagName, this.ExcludedTags) > -1)
				continue;
			//if the only children are excluded children, don't add the module
			if ($(module).find(this.ExcludedString).length === $(module).find('*').length)
				continue;
			if (!this.isModuleValid(module))
				continue;
			
			
			//if  two modules visually overlap, keep the smaller of the modules	
	/*
			var isValid = true;	
				for (var i = 0; i < modules.length; i++) {
				
					if (this.contains(module, modules[i])) {
						console.log("FOUND a containment\n");
						modules.splice($.inArray(modules[i], modules), 1);
						break;
					} else if (this.contains(modules[i], module)) {
						isValid = false;
						console.log("FOUND a containment\n");
						break;
					}
				}
				
				if (!isValid)
					continue;
				*/
	
			/*
			for (var i = 0; i < modules.length; i++) {

			*/

			// if the combined module is a parent to that module
			/*
			 if ($(combinedModule).has(modules[i]).length > 0) {
			 console.log("is parent");
			 //remove the module
			 modules.splice($.inArray(modules[i], modules), 1);
			 i--;
			 continue;
			 }*/

			/*
			 if (this.collidesWith(combinedModule, modules[i]))
			 alert("collision occured");*/

			/*
			 if (this.closeEnough(combinedModule, modules[i])) {
			 console.log("mergining");
			 mergedModule = this.merge(combinedModule, modules[i]);
			 if (mergedModule == null)
			 continue;
			 combinedModule = mergedModule;
			 //remove the other module
			 modules.splice($.inArray(modules[i], modules), 1);
			 i--;
			 }*/

			/*		}*/

			newModules.push(combinedModule);
		}
		return newModules;
	},
	
	//does moduleB visually contain moduleA?
	contains : function(moduleA, moduleB) {
		jmoduleA = $(moduleA);
		var x1 = jmoduleA.position().left;
		var y1 = jmoduleA.position().top;
		var x2 = x1 + jmoduleA.width();
		var y2 = y1;
		var x3 = x1;
		var y3 = y1 + jmoduleA.height();
		var x4 = x2;
		var y4 = y3;

		return this.isWithin(moduleB, x1, y1) && this.isWithin(moduleB, x2, y2) && this.isWithin(moduleB, x3, y3) && this.isWithin(moduleB, x4, y4)
	},
	
	//do these modules visually overlap?
	collidesWith : function(moduleA, moduleB) {
		jmoduleA = $(moduleA);
		var x1 = jmoduleA.position().left;
		var y1 = jmoduleA.position().top;
		var x2 = x1 + jmoduleA.width();
		var y2 = y1;
		var x3 = x1;
		var y3 = y1 + jmoduleA.height();
		var x4 = x2;
		var y4 = y3;

		return this.isWithin(moduleB, x1, y1) || this.isWithin(moduleB, x2, y2) || this.isWithin(moduleB, x3, y3) || this.isWithin(moduleB, x4, y4)
	},
	
	// are the coordinates x and y located within the module?
	isWithin : function(module, x, y) {
		jmodule = $(module);
		var x1 = jmodule.position().left;
		var x2 = jmodule.position().left + jmodule.width();
		var y1 = jmodule.position().top;
		var y2 = jmodule.position().top + jmodule.height();
		if (x1 <= x && x <= x2 && y1 <= y && y <= y2)
			return true;
		else
			return false;
	},
	
	//are two modules close enough? it returns true if two modules seem to be structured similarly and are close together
	/**
	 * EX:
	 *  [][]  these two modules are close enough
	 *  
	 * 
	 * 	[]  as are these two
	 *  [] 
	 */
	closeEnough : function(moduleA, moduleB) {
		var tolerance = 2;
		var positionA = $(moduleA).position();
		var positionB = $(moduleB).position();
		var heightA = $(moduleA).height();
		var heightB = $(moduleB).height();
		var widthA = $(moduleA).width();
		var widthB = $(moduleB).width();
		console.log("====================");
		console.log("left: " + positionA.left + ", " + positionB.left);
		console.log("top: " + positionA.top + ", " + positionB.top);
		console.log("height: " + heightA + ", " + heightB);
		console.log("width: " + widthA + ", " + widthB);
		console.log("====================");
		console.log("left positioning diff: " + Math.abs(positionA.left - positionB.left));

		if (Math.abs(positionA.left - positionB.left) < tolerance && Math.abs(widthA - widthB) < tolerance) {
			var below, above;

			if (positionA.top < positionB.top) {
				below = $(moduleA);
				above = $(moduleB);
			} else {
				below = $(moduleB);
				above = $(moduleA);
			}

			console.log("top poisitions: " + Math.abs(below.position().top + below.height() - above.position().top));
			if (Math.abs(below.position().top + below.height() - above.position().top) < tolerance) {
				console.log("top close enough");
				console.log(moduleA);
				console.log(moduleB);
				alert("mergining verticaly");
				return true;

			}
			return false;
		}
		console.log("top positioning diff: " + Math.abs(positionA.top - positionB.top));
		if (Math.abs(positionA.top - positionB.top) < tolerance && Math.abs(heightA - heightB) < tolerance) {
			var left, right;
			console.log("fd");
			if (positionA.left < positionB.left) {
				left = $(moduleA);
				right = $(moduleB);
			} else {
				left = $(moduleB);
				right = $(moduleA);
			}
			console.log("f");
			if (Math.abs(left.position().left + left.width() - right.position().left) < tolerance) {
				console.log("left close enough");
				console.log(moduleA);
				console.log(moduleB);
				alert("merging horizontally " + left.position().top);

				return true;

			}
			return false;
		}

		return false;
	},

	//combines moduleA and moduleB into one jquery module
	merge : function(moduleA, moduleB) {
		var parentsA = $.makeArray($(moduleA).parents());
		var parentsB = $.makeArray($(moduleB).parents());

		for (var i = 0; i < parentsA.length; i++) {

			if ($.inArray(parentsA[i], parentsB) > -1) {
				if ($(parentsA[i]).parents().length < 2)
					return null;
				return parentsA[i];
			}
		}
		//this can't happen
		return null;
	},
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
		var fontChanged = false;
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

		var sizeUpButton = $('<input/>').attr({
			value : '^',
			class : 'moduleBtn'
		}).button().click(function() {
			if (!fontChanged) {
				//all children of the module need to inherit this font size
				module.find('*').css("font-size", "inherit");
				fontChanged = true;
			}
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
			if (!fontChanged) {
				//all children of the module need to inherit this font size
				module.find('*').css("font-size", "inherit");
				fontChanged = true;
			}
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
		
		buttons.push(closeButton);
		buttons.push(dragButton);
		buttons.push(sizeUpButton);
		buttons.push(sizeDownButton);
		buttons.push(isolateButton);
		/*****************************/

		return buttons;
	},

	modularize : function(doc) {
		$('.module_Modulr').each(function() {
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
							top : module.position().top,
							//bring this element to the very front (so the buttons arent hidden by other elements)
							zIndex: 9999
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
		Modularizer.modularize(document);

		/*
		 for (var i = 0; i < modules.length; i++) {

		 var current = modules[i];
		 $(current).parents().each(function() {
		 var currentParent = $(this).get(0);
		 if ($.inArray(currentParent, modules) > -1) {

		 console.log("============================ parent found ===========================");
		 //kick the parent
		 modules.splice($.inArray(currentParent, modules), 1);
		 }
		 });

		 }*/

		console.log(document);
		Modulr.modularize(document);
	}
};

$(document).ready(function() {
	Modulr.process(document);
});

