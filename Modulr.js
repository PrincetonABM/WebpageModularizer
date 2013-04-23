var Cleaner = {
	clean : function(doc) {
		$("script").remove();
		$("meta").remove();
	}
};

var Modularizer = {
	// Tags that should be divided by
	SplitTags : ["MAP", "ARTICLE", "CANVAS", "DIV", "FIGURE", "FOOTER", 
				"HEADER", "P", "SECTION", "SPAN", "OL", "UL", "TBODY", 
				"TABLE", "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "DL", 
				"ADDRESS", "DD", "BLOCKQUOTE"],
	SplitString : "map, article, canvas, div, figure, footer, header, img, p, section, span, ol, ul, tbody, table, h1, h2, h3, h4, h5, h6, pre, dl, address, dd, blockquote",
	//Tags that must not be contained within modules
	ExcludedTags : ["SCRIPT", "IFRAME"],
	ExcludedString : "script, iframe",
	// min pixel area for a module
	MIN_AREA : 2,
	// max pixel area for a single module
	MAX_AREA : screen.height * screen.width * 0.8,
	// max average area for the modules
	MAX_AVG_AREA : screen.height * screen.width * 0.1,
	//modules with text must have at least some minimum length
	MIN_TEXT_LENGTH : 10,
	//we don't want the algorithm to run forever, so there are a max number of levels that are traversed
	MAX_DEPTH : 50,
        currentModuleNumber : 0,

	//return the area of the single element
	getArea : function(elem) {
		return $(elem).height() * $(elem).width();
	},
	// return the average area of the elements
	getAvgElementSize : function(elements) {
		var totSize = 0;
		for (var i = 0; i < elements.length; i++) {
			totSize += this.getArea(elements[i]);
		}
		return totSize / elements.length;
	},
	// return the area of the largest element
	getLargestElementSize : function(elements) {
		var largestArea = 0;
		for (var i = 0; i < elements.length; i++) {
			if (this.getArea(elements[i]) > largestArea) {
				largestArea = this.getArea(elements[i]);
			}
		}
		return largestArea;
	},
	//get the area of all of the elements
	getTotalArea : function(elements) {
		var area = 0;
		for (var i = 0; i < elements.length; i++) {
			area += this.getArea(elements[i]);
		}
		return area;
	},

	//find and wrap up modules
	modularize : function(doc) {
		var modules = new Array();
		var body = $(document).find('body')[0];
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

				// if this element has no children, just add the element itself to the next level
				if ($(curElem).children().length == 0) {
					target.push(curElem);
				}

				$(curElem).children().each(function() {
					target.push($(this)[0]);
				});
			}
			console.log("Total area: " + this.getTotalArea(target));
			level++;
			if (level > this.MAX_DEPTH) {
				console.log("MAX_DEPTH reached");
				console.log("area: " + this.getAvgElementSize(target));
				break;
			}
			if ((this.getAvgElementSize(target) < this.MAX_AVG_AREA)) {
				console.log("largest area: " + this.getLargestElementSize(target));
				console.log("max area: " + this.MAX_AREA);
				console.log("area: " + this.getAvgElementSize(target));
				console.log("level: " + level);
				break;
			}

			cur = (cur == 'A') ? 'B' : 'A';
			source = (cur == 'A') ? elementsA : elementsB;
			target = (cur == 'A') ? elementsB : elementsA;
		} while (elementsA.length > 0 || elementsB.length > 0);
		console.log(this.getAvgElementSize(target));
		console.log("There are elements: " + target.length);
		modules = this.processModules(target);
		console.log("there are modules: " + modules.length);
		this.wrapModules(modules);
	},

	//wrap the modules in a div tag with a specific class
	wrapModules : function(modules) {
		for (var i = 0; i < modules.length; i++) {
                    // Added to ensure numbering from 0-(i-1)
			if (modules[i].tagName == 'BODY' || modules[i].tagName == 'HTML') {
                            modules = modules.not($(modules[i]));
                            i--;
                            continue;
                        }	

			var module = $(modules[i]);
			console.log("AREA: " + module.width() * module.height());
			console.log(modules[i]);
                        // Changed id to include the number of the module
			module.wrap('<div class="module_Modulr" id = "unset" />');
                        module.parent().data('Module_number', Modularizer.currentModuleNumber);
                        Modularizer.currentModuleNumber++;
		}
	},
	printArray : function(arr) {
		console.log("array is: ");
		for (var i = 0; i < arr.length; i++) {
			console.log(arr[i]);
		}
	},
	//uses heuristics to process and validate modules
	processModules : function(modules) {
		var newModules = new Array();
		while (modules.length > 0) {
			var module = modules.shift();
			if ($(module).is('.moduleBtn')) { 
				continue;
			}
			console.log("processing this module:");
			console.log(module);

			if ($.inArray(module.tagName, this.ExcludedTags) > -1)
				continue;

			//is the module and its children big enough?
			if (this.getArea(module) < this.MIN_AREA) {
				var tooSmall = true;
				$(module).find('*').each(function() {
					if (!tooSmall)
						return;
						
					if (Modularizer.getArea(this) > Modularizer.MIN_AREA)
						tooSmall = false;

				});

				if (tooSmall) {
					console.log("module too small");
					continue;
				}
			}

			//if the module does not have a tagName that can be split by get the closest parent with the right tag
			if ($.inArray(module.tagName, this.SplitTags) == -1) {
				var parents = $(module).parents(this.SplitTags);
				if (parents.length == 0)
					continue;
				console.log("NOTE module does not have a valid tag name");
				console.log(module);
				module = parents.eq(0)[0];
				console.log(module);
				if (module.tagName == "BODY")
					continue;
				
				for (var i  = 0; i < newModules.length;i++) {
					var otherModule = $(newModules[i]);
					
					//check if the other module is a child of the current module
					if ($(module).has(otherModule).length > 0) {
						console.log("removing the following module")
						console.log(otherModule[0])
						newModules.splice(i, 1);
						i--;
					}
				}
				
				var isValid = true;
				for (var i  = 0; i < newModules.length;i++) {
					var otherModule = $(newModules[i]);
					
					//check if the other module is a parent of the current module
					if (otherModule.has($(module)).length > 0) {
						isValid = false;
						break;
					}
					
				}
				
				if (!isValid) {
					continue;
				}
				
				newModules.push(module);
				continue;
			}
		
			var isValid = true;
			for (var i = 0; i < newModules.length; i++) {
				var otherModule = $(newModules[i]);

				//check if the other module is a parent of the current module
				if (otherModule.has($(module)).length > 0) {
					isValid = false;
					break;
				}

			}

			if (!isValid) {
				console.log("Module already has parent");
				continue;
			}

			if ($(module).children().length <= 0) {
				newModules.push(module);
				continue;
			}

			//if the only children are excluded children, don't add the module
			if ($(module).find(this.ExcludedString).length === $(module).find('*').length) {
				console.log("all children excluded");
				continue;

			}

			var textLength = $(module).text().length;
			//if the children have a longer aggregate text length or the children have an aggregate text length that is close to the original AND if the area of the module is less than the total area of the children
			// or if the children are within 0.1 of the original parent area
			//add them for processing
			if (textLength > 0 && $(module).children().length > 0) {
				if (($(module).children(this.SplitString).text().length > textLength || Math.abs($(module).children(this.SplitString).text().length - textLength) < 0.1 * textLength) 
					&& (this.getArea(module) < this.getTotalArea($(module).children().toArray()) || Math.abs(this.getArea(module) - this.getTotalArea($(module).children().toArray())) < 0.1 * this.getArea(module))) {
					console.log("adding the children");
					$(module).children(this.SplitString).each(function() {
						modules.push($(this)[0]);
					});
					continue;
				}
			}
			console.log("successfully adding the module")
			newModules.push(module);
		}
		return newModules;
	},

	/***** THE FUNCTIONS BELOW ARE CURRENTLY UNUSED IN THE IMPLEMENTATION **/

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
        // Sequence of customizations made by the user
        Moves : [],
                
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
				module.find('*').css({
					"font-size" : "inherit",
					"line-height" : "1.4"
				});
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
					opacity : "0.8",
					"text-shadow": "0 0 20px #000",
					color: "transparent",
				});
			} else {
				$('*').css({
					opacity : "1.0",
					"text-shadow": "",
					color: "",
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

		spacing += isolateButton.outerWidth();
		var splitButton = $('<input/>').attr({
			value : 'S',
			class : 'moduleBtn'
		}).button().click(function() {
			
			if (!Modulr.split(module)) {
				alert("This module can't be split");
				return;
			}
                        
			//remove the buttons associated with the original (now split) module
			for (var i = 0; i < buttons.length; i++) {
				var button = buttons[i];
				button.remove();
				/*
				button.css({
									visibility : 'hidden'
								});*/
			}
			//recall this function as there are now new modules
			Modulr.modularize(document);

		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		});
		
		spacing += splitButton.outerWidth();
		var mergeButton = $('<input/>').attr({
			value : 'M',
			class : 'moduleBtn'
		}).button().click(function() {
			if (!Modulr.mergeToParent(module)) {
				return;
			}
			//remove the buttons associated with the original (now merged) module
			for (var i = 0; i < buttons.length; i++) {
				var button = buttons[i];
				button.css({
					visibility : 'hidden'
				});
			}
			
			//re-call this function as there are now new modules
			Modulr.modularize(document);
			
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
		buttons.push(splitButton);
		buttons.push(mergeButton);
		/*****************************/

		return buttons;
	},
	mergeToParent : function(module) {
		if (module.parents().length < 2) {
			alert("This module can't be merged");
			return false;
		}
		var parent = module.parent();
		// remove all children that are modules
		parent.find('.module_Modulr').each(function() {
			var child = $(this).children().eq(0);
			child.unwrap();
			
		});
		//if the parent is already a module, you're done
		if (module.parent('.module_Modulr').length > 0) {
			return;
		}
		console.log("adding parent:");
		console.log(parent[0]);
		
		parent.wrap('<div class="module_Modulr" id="unset" />');
		return true;
	},
	split : function(module) {
		//unwrap the module
		var child = module.children().eq(0);
		if (child.children(this.SplitTags).length <= 0) {
			return false;
		}
                Modulr.Moves.push(parseInt(module.data("Module_number")));
                Modulr.Moves.push('s');
		child.unwrap();
		var subModules = new Array();

		//get the children
		child.children(this.SplitTags).each(function() {
			subModules.push($(this)[0]);
		});
		
		console.log("submodules: " + subModules.length);
		//process and wrap the children
		subModules = Modularizer.processModules(subModules);
		
		if (subModules.length == 0) {
			return false;
		}
		
		var isValid = true;
		//are any of the modules the parent? this can happen if a child doesn't have the right tag
		for (var i = 0; i < subModules.length; i++) {
			if (subModules[i] == child) {
				isValid = false;
				break;
			}
			//does the current module have any submodules as parents?
			if (module.parents($(subModules[i])).length) {
				isValid = false;
				break;
			}
		}
		
		if (!isValid) {
			return false;
		}
		
		Modularizer.wrapModules(subModules);
		return true;

	},
	modularize : function(doc) {
		$('.module_Modulr').each(function() {
			var module = $(this);

			//setting this attribute means that modules that have already been processed are not processed again.
			if (module.attr('id') == 'set')
				return;

			module.prop('id', 'set');
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
							zIndex : 9999
						});
						spacing += button.outerWidth();
					}

				},
				mouseover : function() {
					module.css("box-shadow", "0 0 10px #000");
				},
				mouseenter : function() {
					module.css("box-shadow", "0 0 10px #000");
					//module.css("outline", "green dotted 5px");
					

				},
				mouseleave : function() {
					module.css("box-shadow", "0 0 0px #000");
					//module.css("outline", "green dotted 0px");

				}
			});
		});
	},
	// Save the current customization of the page
	save : function() {
		var saveButton = $('body').append('<input class="Modulr_save_button"></input>');
		$('.Modulr_save_button').attr({
			value : 'S',
			class : 'saveBtn'
		}).click(function() {
                    // Save the current page customization
                    var wrappedModules = $('.module_Modulr');
                    var storageName = 'Modulr_module_attributes_' + window.location;
                    var storageName2 = 'Modulr_module_splits_' + window.location;
                    var arr = [];
                    var length = wrappedModules.length;
                    wrappedModules.each( function() {
                        var style = window.getComputedStyle($(this)[0]);
                        arr[$(this).data("Module_number")] = style.cssText;
                    });
                    
                    localStorage[storageName] = JSON.stringify(arr);
                    localStorage[storageName2] = JSON.stringify(Modulr.Moves);
		}).css({
			position : 'fixed',
			left : '90%',
			top : '20px',
			'font-size' : '10px',
			width : '35px',
			height : '22px',
			'border-radius' : '3px',
			visibility : 'visible'
		});
        },
                
        // Load a saved customization        
        checkForLoad: function() {
            var storageName = 'Modulr_module_attributes_' + window.location;
            var storageName2 = 'Modulr_module_splits_' + window.location;
            if(!(storageName in localStorage)){
                return false;
            }
            alert('Loading from Save');
            var attributes = JSON.parse(localStorage[storageName]);
            var splitMoves = JSON.parse(localStorage[storageName2]);
            
            for (var i = 0; i < splitMoves.length / 2; i++) {
               if (splitMoves[i * 2 + 1] === 's') {
                    $(":data(Module_number)").each(function() {
                        if ($(this).data("Module_number") === splitMoves[i * 2]) {
                            Modulr.split($(this));
                            Modulr.modularize(document);
                        }
                    });
                    
               }
            }
            // Find the modules from the array of html contents from the save
            $(":data(Module_number)").each(function() {
                $(this)[0].setAttribute("style", attributes[$(this).data("Module_number")]);
            });
            return true;
        },
	process : function(doc) {
                Modularizer.modularize(document);
                console.log(document);
		Modulr.modularize(document);
                Modulr.checkForLoad();
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
                Modulr.save();
	}
};

$(document).ready(function() {
	Modulr.process(document);
});

