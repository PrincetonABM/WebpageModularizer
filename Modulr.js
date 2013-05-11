/**
 * Takes wrapped up modules and adds UI features to the modules to allow for customizability
 *
 * Input: A document with modules wrapped in tags with a unique identifier (with a class, id, name...)
 * Output: UI customizability features added to these modules
 */

//initial font size (100%)
var fontSize = 100;

var Modulr = {

	//this variable can be changed later. i only have this to resolve the problem of limited function scope
	//was the load request successful?
	loadSuccess : true,
	processing : true,
	// Sequence of customizations made by the user
	Moves : [],

	process : function(doc) {
		//add the notification divs
		var body = $(document).find('body');
		var notificationGood = $('<span class="notification_Modulr_good" />');
		body.after(notificationGood);
		var notificationBad = $('<span class="notification_Modulr_bad" />');
		body.after(notificationBad);
		notificationBad.css('visibility', 'hidden');
		notificationGood.css('visibility', 'hidden');
		//add an initial notfication
		Modulr.notificationGood("Modularizing the page...");
		
		Modularizer.modularize(document);
		console.log(document);
		if (!Modulr.checkForLoad())
			Modulr.modularize(document);
		Modulr.addSideBar();
		//add ability to tooltip stuff on the page
		$(document).tooltip();
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
			this.addEventListener('click', function() {
				console.log("suppp");
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
						top : module.position().top - 27,
						//bring this element to the very front (so the buttons arent hidden by other elements)
						zIndex : 9999
					});

					if (module.offset().top < 27)
						button.css({
							top : module.position().top
						});
					spacing += button.outerWidth();
				}

			}, true)

			this.addEventListener('mouseover', function() {
				module.css("box-shadow", "0 0 10px #000");
				//reset the positions of the buttons
				var spacing = 0;
				for (var i = 0; i < buttons.length; i++) {
					var button = buttons[i];
					button.css({
						position : 'absolute',
						left : module.position().left + spacing,
						top : module.position().top - 27,
						//bring this element to the very front (so the buttons arent hidden by other elements)
						zIndex : 9999
					});

					if (module.offset().top < 27)
						button.css({
							top : module.position().top
						});
					spacing += button.outerWidth();
				}
			}, true)

			this.addEventListener('mouseout', function() {
				module.css("box-shadow", "0 0 0px #000");
			}, true)

		});
	},
	//create and return the buttons
	createButtons : function(module) {

		var buttons = new Array();
		var isDraggable = false, isResizable = false, isIsolated = false;
		var fontChanged = false;

		var spacing = 0;

		/******* create the buttons **********/
		var closeButton = $('<input/>').attr({
			value : "\u2716",
			class : 'moduleBtn',
			id : 'close',
			title : 'Hide this module from the page'
		}).button().css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden'
		}).click(function() {
			if (module.css('visibility') == 'visible' || module.css("visibility").length == 0) {
				module.css('visibility', 'hidden');
				// iframes don't work well with the visibility css
				module.find('iframe').css({
					opacity : 0
				});
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i] != closeButton)
						buttons[i].css('visibility', 'hidden');
				}
				closeButton.button("option", "label", "!");
			} else {
				for (var i = 0; i < buttons.length; i++) {
					buttons[i].css('visibility', 'visible');
				}
				module.trigger('click');
				module.css('visibility', 'visible');
				// iframes don't work well with the visibility css
				module.find('iframe').css({
					opacity : 1.0
				});
				closeButton.button("option", "label", "X");
			}
		});

		spacing += closeButton.outerWidth();

		var dragButton = $('<input/>').attr({
			value : '\u2725',
			class : 'moduleBtn',
			id : 'drag',
			title : 'Move this module around the page'
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
			value : '\u2191',
			class : 'moduleBtn',
			id : 'sizeup',
			title : 'Increase this module\'s font size'
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
			value : '\u2193',
			class : 'moduleBtn',
			id : 'sizedown',
			title : 'Decrease this module\'s font size.'
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
			class : 'moduleBtn',
			id : 'isolate',
			title : 'Isolate this module on the page.'
		}).button().click(function() {

			if (!isIsolated) {
				$('*').not(module.parents()).not(module.find('*')).not(module).not(".moduleBtn").not(".sideBarBtn").not(".notification_Modulr_good").not(".notification_Modulr_bad").not(".side-bar").not($("body").siblings()).css({
					visibility : 'hidden'
				});

			} else {
				$('*').not(module.parents()).not(module.find('*')).not(module).not(".moduleBtn").not(".sideBarBtn").not(".notification_Modulr_good").not(".notification_Modulr_bad").not(".side-bar").not($("body").siblings()).css({
					visibility : 'visible'
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
			class : 'moduleBtn',
			id : 'split',
			title : 'Divide this module into smaller modules.'
		}).button().click(function() {

			if (!Modulr.split(module)) {
				Modulr.notificationBad("This module can't be split");
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
			class : 'moduleBtn',
			id : 'merge',
			title : 'Merge this module with other modules.'
		}).button().click(function() {
			//merge until the area is larger than that of the original modules
			var origArea = Modularizer.getArea(module[0]);
			var newParent = module;
			do {
				newParent = Modulr.mergeToParent(newParent);
				if (newParent == null)
					break;
				console.log("new parent area: " + Modularizer.getArea(newParent[0]));
				console.log("old area: " + origArea);
			} while (newParent != null && Modularizer.getArea(newParent[0]) <= origArea);

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

		spacing += splitButton.outerWidth();
		var colorButton = $('<input/>').attr({
			type : 'color',
			class : 'moduleBtn',
			id : 'colr',
			title : 'Change text color.'
		}).button().css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			width : '2%',
			visibility : 'hidden',
			'padding-top' : 0,
			'padding-bottom' : 0
		}).change(function() {
			module.find('*').css("color", this.value);
		});

		spacing += colorButton.outerWidth();

		var fonts = new Array('Arial,Arial,Helvetica,sans-serif', 'Arial Black,Arial Black,Gadget,sans-serif', 'Comic Sans MS,Comic Sans MS,cursive', 'Courier New,Courier New,Courier,monospace', 'Georgia,Georgia,serif', 'Impact,Charcoal,sans-serif', 'Lucida Console,Monaco,monospace', 'Lucida Sans Unicode,Lucida Grande,sans-serif', 'Palatino Linotype,Book Antiqua,Palatino,serif', 'Tahoma,Geneva,sans-serif', 'Times New Roman,Times,serif', 'Trebuchet MS,Helvetica,sans-serif', 'Verdana,Geneva,sans-serif');
		var select1 = $('<select/>').attr({
			id : 'combobox',
			class : 'moduleBtn',
			title : 'Change text font.'
		}).css({
			position : 'absolute',
			left : module.position().left + spacing,
			top : module.position().top,
			'font-size' : '10px',
			visibility : 'hidden',
			height : '25px'
		}).change(function() {
			module.find('*').css("font-family", this.value);
		})

		jQuery.each(fonts, function(i, item) {
			var opt = $('<option/>');
			opt.attr('value : "' + item + '"');
			opt.attr("style = 'font-family': '" + item + "'");
			opt.text(item.split(',')[0]);
			select1.append(opt);
		})

		buttons.push(closeButton);
		buttons.push(dragButton);
		buttons.push(sizeUpButton);
		buttons.push(sizeDownButton);
		buttons.push(isolateButton);
		buttons.push(splitButton);
		buttons.push(mergeButton);
		buttons.push(colorButton);
		buttons.push(select1);
		/*****************************/

		return buttons;
	},

	mergeToParent : function(module) {
		if (module.parents().length < 2) {
			Modulr.notificationBad("This module can't be merged");
			return false;
		}
		Modulr.Moves.push(parseInt(module.data("Module_number")));
		Modulr.Moves.push(module.html().match(/<[^>\s]*/g));
		Modulr.Moves.push('m');
		var parent = module.parent();
		// remove all children that are modules
		parent.find('.module_Modulr').each(function() {
			var child = $(this).children().eq(0);
			child.unwrap();
		});

		//if the parent is already a module, get the parent of that module
		if (module.parent('.module_Modulr').length > 0) {
			return null;
		}
		console.log("adding parent:");
		console.log(parent[0]);

		parent.wrap('<div class="module_Modulr" id="unset" />');
		return parent;
	},
	split : function(module) {
		//unwrap the module
		var child = module.children().eq(0);
		if (child.children(this.SplitTags).length <= 0) {
			return false;
		}
		Modulr.Moves.push(parseInt(module.data("Module_number")));
		Modulr.Moves.push(module.html().match(/<[^>\s]*/g));
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

	// Save the current customization of the page
	save : function() {
		// Save the current page customization
		var wrappedModules = $('.module_Modulr');
		var arr = [];
		var tags = [];
		wrappedModules.each(function() {
			var style = window.getComputedStyle($(this)[0]);
			var current = $(this).data("Module_number");
			arr[current] = style.cssText;
			var html = $(this).html();
			tags[current] = html.match(/<[^>\s]*/g);
		});
		console.log(tags);
		/*for (var i = 0; i < tags.length; i++) {
		 tags[i] = JSON.stringify(tags[i]);
		 }
		 console.log('---------------------------');
		 console.log(tags);*/
		chrome.runtime.sendMessage({
			command : "save",
			attributes : JSON.stringify(arr),
			split : JSON.stringify(Modulr.Moves),
			tags : JSON.stringify(tags)
		}, function(response) {
			return;
		});
	},

	// Load a saved customization
	checkForLoad : function() {
		chrome.runtime.sendMessage({
			command : "load"
		}, function(response) {
			console.log("receiving message");
			Modulr.success = response.success;
			console.log(Modulr.success);
			if (!Modulr.success) {
				return;
			}
			Modulr.notificationGood('Loading saved configuration.');
			var attributes = JSON.parse(response.attributes);
			var splitMoves = JSON.parse(response.split);
			var tags = JSON.parse(response.tags);

			/*for (var i = 0; i < tags.length; i++)
			 tags[i] = JSON.parse(tags[i]);*/
			console.log(tags);
			for (var i = 0; i < splitMoves.length / 3; i++) {
				var modules = $(":data(Module_number)");
				var offset = 0;
				var splitTags = splitMoves[i * 3 + 1];
				$(this).data("Module_number") === splitMoves[i * 2];

				if (splitMoves[i * 3 + 2] === 's')
					console.log("Attempting to Split\nSearching For:");
				else
					console.log("Attempting to Merge\nSearching For:");
				console.log(splitMoves[i * 3 + 1]);
				while (!(offset > modules.length)) {
					var currentTags;
					var currentElement = 0;

					modules.each(function() {
						if ($(this).data("Module_number") === splitMoves[i * 3] + offset) {
							currentTags = $(this).html().match(/<[^>\s]*/g);
							currentElement = $(this);
						}
					});

					if (currentElement === 0) {
						if (offset === 0)
							offset++;
						else if (offset > 0)
							offset *= -1;
						else
							offset = (offset * -1) + 1;
						continue;
					}

					var found = 0;
					for (var j = 0; j < splitTags.length; j++) {
						var index = currentTags.indexOf(splitTags[j]);
						if (index !== -1) {
							found++;
							currentTags.splice(index, 1);
						}
					}

					var longerLength = splitTags.length;
					if ((currentTags.length + found) > longerLength)
						longerLength = currentTags.length + found;
					if ((splitTags.length) === 0 || found / longerLength >= .85) {
						if (splitMoves[i * 3 + 2] === 's') {
							console.log('Found! Splitting...');
							Modulr.split(currentElement);
							Modulr.modularize(document);
						} else {
							console.log('Found! Merging...');
							Modulr.mergeToParent(currentElement);
							Modulr.modularize(document);
						}
						break;
					} else {
						if (offset === 0)
							offset++;
						else if (offset > 0)
							offset *= -1;
						else
							offset = (offset * -1) + 1;
					}
				}
			}

			var modules = $(":data(Module_number)");

			while (modules.length > 0) {
				var current = modules.eq(0);

				var index = 0;
				for (var j = 0; j < modules.length; j++) {
					if (modules.eq(j).data("Module_number") < current.data("Module_number")) {
						current = modules.eq(j);
					}
				}
				modules = modules.not(current);

				//console.log('THIS:');
				//console.log(current.html().match(/<[^>\s]*/g));

				var currentTags = current.html().match(/<[^>\s]*/g);
				for (var j = 0; j < tags.length; j++) {
					if (tags[j] === null)
						continue;
					var currentTagsClone = currentTags.slice(0);
					var found = 0;
					for (var i = 0; i < tags[j].length; i++) {
						var index = currentTagsClone.indexOf(tags[j][i]);
						if (index !== -1) {
							found++;
							currentTagsClone.splice(index, 1);
						}
					}

					var longerLength = tags[j].length;
					if ((currentTags.length) > longerLength)
						longerLength = currentTags.length;
					if ((tags[j].length) === 0 || found / longerLength >= .85) {
						//console.log('MATCHED TO:');
						//console.log(tags[j]);
						current[0].setAttribute("style", attributes[j]);
						attributes.splice(j, 1);
						tags.splice(j, 1);
						break;
					}
				}
			}

		});
		return Modulr.success;
	},

	//temporarily display a notificaton at the top of the page
	notificationGood : function(text) {
		$('.notification_Modulr_good').css('visibility', 'visible');
		$('.notification_Modulr_good').text(text);
		$('.notification_Modulr_good').fadeIn().delay(3000).fadeOut();
		$('.notification_Modulr_good').css("visiblity", "hidden");
	},

	notificationBad : function(text) {
		$('.notification_Modulr_bad').css('visibility', 'visible');
		$('.notification_Modulr_bad').text(text);
		$('.notification_Modulr_bad').fadeIn().delay(3000).fadeOut();
		$('.notification_Modulr_bad').css("visiblity", "hidden");
	},

	addSideBar : function() {
		var body = $(document).find('body');
		var globals = $('<div class="globals"></div>');
		var sideBar = $('<div class="side-bar"></div>');
		sideBar.append('<div class="handle" />');
		sideBar.append(globals);
		var isHighlighted = false, modulesOpen = true, isDisabled = false;

		/** add the buttons **/
		var showModulesBtn = $('<input/>').attr({
			value : 'Highlight Modules',
			class : 'sideBarBtn'
		}).button().click(function() {
			Modulr.highlightModules(isHighlighted);
			if (isHighlighted) {
				showModulesBtn.button("option", "label", "Highlight Modules");
			} else {
				showModulesBtn.button("option", "label", "Remove Highlights");
			}
			isHighlighted = !isHighlighted;
		}).css({
			width : '125px'
		});

		var removeModulesBtn = $('<input/>').attr({
			value : 'Remove all Modules',
			class : 'sideBarBtn'
		}).button().click(function() {
			if (modulesOpen) {
				Modulr.notificationGood($('.module_Modulr').length + " modules removed.");
				//hide all modules
				$('.module_Modulr').css('visibility', 'hidden');
				$('.module_Modulr').find('iframe').css('opacity', '0');
				//close all buttons
				$('.moduleBtn').css('visibility', 'hidden');
				//show only the close buttons
				$('#close.moduleBtn').css('visibility', 'visible');
				//change close button icon
				$('#close.moduleBtn').button("option", "label", "!");
				removeModulesBtn.button("option", "label", "Return all Modules");
			} else {
				//hide all module buttons
				$('.moduleBtn').css("visibility", "hidden");
				//show all modules
				$('.module_Modulr').css('visibility', 'visible');
				$('.module_Modulr').find('iframe').css('opacity', '1');
				//change close button icon
				$('#close.moduleBtn').button("option", "label", "X");
				removeModulesBtn.button("option", "label", "Remove all Modules");
			}
			modulesOpen = !modulesOpen;
		}).css({
			width : '125px'
		});

		var saveModulesBtn = $('<input/>').attr({
			value : 'Save Configuration',
			class : 'Modulr_save_button sideBarBtn'
		}).button().click(function() {
			Modulr.notificationGood("Module configuration has been saved.");
			Modulr.save();
		}).css({
			width : '125px'
		});

		var loadModulesBtn = $('<input/>').attr({
			value : 'Load Configuration',
			class : 'sideBarBtn'
		}).button().click(function() {
			if (Modulr.checkForLoad())
				Modulr.notificationGood("Previous module configuration has been loaded.");
			else
				Modulr.notificationBad("No saved module configuration found.");

		}).css({
			width : '125px'
		});

		var disableModulesBtn = $('<input/>').attr({
			value : 'Disable Modulr',
			class : 'sideBarBtn'
		}).button().click(function() {
			//close all buttons
			$('.moduleBtn').css('visibility', 'hidden');
			//detach event handlers
			$('.module_Modulr').off();
			$('.sideBarBtn').off();
			$('.side-bar').off();
			$('.sideBarBtn').remove();
			$('.side-bar').remove();
		}).css({
			width : '125px'
		});

		function disablr(evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}

		var disableBtn = $('<input/>').attr({
			value : 'Disable webpage',
			class : 'sideBarBtn moduleBtn'
		}).button().click(function() {

			if (!isDisabled) {
				$('.module_Modulr').each(function() {
					this.addEventListener('click', disablr, true);
					this.addEventListener('mouseover', disablr, true);
				})
				disableBtn.button("option", "label", "Enable webpage");
			} else {
				$('.module_Modulr').each(function() {
					this.removeEventListener('click', disablr, true);
					this.removeEventListener('mouseover', disablr, true);
				})
				disableBtn.button("option", "label", "Disable webpage");
			}
			isDisabled = !isDisabled;
		}).css({
			width : '125px'
		});

		var splitAllModulesBtn = $('<input/>').attr({
			value : 'Split all Modules',
			class : 'sideBarBtn'
		}).button().click(function() {
			$('.moduleBtn#split').trigger('click');
		}).css({
			width : '125px'
		});
		var mergeAllModulesBtn = $('<input/>').attr({
			value : 'Merge all Modules',
			class : 'sideBarBtn'
		}).button().click(function() {
			$('.moduleBtn#merge').trigger('click');
		}).css({
			width : '125px'
		});

		var openOptionsBtn = $('<input/>').attr({
			value : 'Options',
			class : 'sideBarBtn'
		}).button().click(function() {
			window.open(chrome.extension.getURL('options.html'));
		}).css({
			width : '125px'
		});

		var fonts = new Array('Arial,Arial,Helvetica,sans-serif', 'Arial Black,Arial Black,Gadget,sans-serif', 'Comic Sans MS,Comic Sans MS,cursive', 'Courier New,Courier New,Courier,monospace', 'Georgia,Georgia,serif', 'Impact,Charcoal,sans-serif', 'Lucida Console,Monaco,monospace', 'Lucida Sans Unicode,Lucida Grande,sans-serif', 'Palatino Linotype,Book Antiqua,Palatino,serif', 'Tahoma,Geneva,sans-serif', 'Times New Roman,Times,serif', 'Trebuchet MS,Helvetica,sans-serif', 'Verdana,Geneva,sans-serif');
		var select1 = $('<select/>').attr({
			id : 'combobox',
			class : 'sideBarBtn'
		}).css({
			float : 'none',
			width : '150px'
		}).change(function() {
			$(document).find('*').not('.moduleBtn').not('.sideBarBtn').css("font-family", this.value);
		})

		jQuery.each(fonts, function(i, item) {
			var opt = $('<option/>');
			opt.attr('value : "' + item + '"');
			opt.attr("style = 'font-family': '" + item + "'");
			opt.text(item.split(',')[0]);
			select1.append(opt);
		})
		var colorButton = $('<input/>').attr({
			type : 'color',
			class : 'sideBarBtn fontColorPicker',
			id : 'colr'
		}).button().css({
			width : '125px',
		}).change(function() {
			$(document).find('*').not('.moduleBtn').not('.sideBarBtn').css("color", this.value);
		});
		var sizeUpButton = $('<input/>').attr({
			value : '\u2191',
			class : 'sideBarBtn'
		}).button().css({
			float : 'left',
			width : '50px'
		}).click(function() {
			fontSize += 25;
			$('.module_Modulr').css("font-size", fontSize + "%");
		});

		var sizeDownButton = $('<input/>').attr({
			value : '\u2193',
			class : 'sideBarBtn'
		}).button().css({
			float : 'left',
			width : '50px'
		}).click(function() {
			fontSize -= 25;
			$('.module_Modulr').css("font-size", fontSize + "%");
		});

		sizeChangeSet = $('<div/>');
		sizeChangeSet.append(sizeUpButton);
		sizeChangeSet.append(sizeDownButton);
		globals.append(showModulesBtn);
		globals.append(removeModulesBtn);
		globals.append(splitAllModulesBtn);
		globals.append(mergeAllModulesBtn);
		globals.append(select1);
		globals.append(colorButton);
		globals.append(sizeChangeSet);
		sideBar.append('<p/>');
		sideBar.append($('<hr>').css("float", "none"));
		sideBar.append(saveModulesBtn);
		sideBar.append(loadModulesBtn);
		sideBar.append(disableModulesBtn);
		sideBar.append(disableBtn);

		sideBar.append('<hr>');
		sideBar.append(openOptionsBtn);
		body.after(sideBar);
		$('.side-bar').tabSlideOut({
			tabHandle : '.handle', //class of the element that will be your tab
			pathToTabImage : chrome.extension.getURL("images/arrow32x32.png"), //path to the image for the tab
			imageHeight : '32px', //height of tab image *required*
			imageWidth : '32px', //width of tab image *required*
			tabLocation : 'left', //side of screen where tab lives, top, right, bottom, or left
			speed : 300, //speed of animation
			action : 'click', //options: 'click' or 'hover', action to trigger animation
			topPos : '0px', //position from the top
			fixedPosition : true //options: true makes it stick(fixed position) on scroll
		});
	},

	highlightModules : function(highlighted) {
		console.log("highlighting modules");
		if (!highlighted) {
			Modulr.notificationGood($('.module_Modulr').length + " modules highlighted.");
			$('.module_Modulr').css({
				"outline" : "blue dashed 3px"
			});
		} else {
			$('.module_Modulr').css({
				outline : ''
			});

		}
	},
};
var Modularizer = {
	// Tags that should be divided by
	SplitTags : ["MAP", "ARTICLE", "CANVAS", "DIV", "FIGURE", "FOOTER", "HEADER", "P", "SECTION", "SPAN", "OL", "UL", "TBODY", "TABLE", "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "DL", "ADDRESS", "DD", "BLOCKQUOTE"],
	SplitString : "map, article, canvas, div, figure, footer, header, img, p, section, span, ol, ul, tbody, table, h1, h2, h3, h4, h5, h6, pre, dl, address, dd, blockquote",
	//Tags that must not be contained within modules
	ExcludedTags : ["SCRIPT", "NOSCRIPT"],
	ExcludedString : "script, noscript",
	// all CSS properties
	allCSS : ['font-family','font-size','font-weight','font-style','color',
	'text-transform','text-decoration','letter-spacing','word-spacing',
	'line-height','text-align','vertical-align','direction','background-color',
	'background-image','background-repeat','background-position',
	'background-attachment','opacity','width','height','top','right','bottom',
	'left','margin-top','margin-right','margin-bottom','margin-left',
	'padding-top','padding-right','padding-bottom','padding-left',
	'border-top-width','border-right-width','border-bottom-width',
	'border-left-width','border-top-color','border-right-color',
	'border-bottom-color','border-left-color','border-top-style',
	'border-right-style','border-bottom-style','border-left-style','position',
	'display','visibility','z-index','overflow-x','overflow-y','white-space',
	'clip','float','clear','cursor','list-style-image','list-style-position',
	'list-style-type','marker-offset'],
	// min pixel area for a module
	MIN_AREA : 2,
	MIN_DIMENSION : 10,
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
		console.log("finding area of: ");
		console.log(elem);
	
		if (elem == undefined)
			return -1;
		console.log(elem.offsetWidth + "x" + elem.offsetHeight);
		return elem.offsetWidth*elem.offsetHeight;
		//return $(elem).height() * $(elem).width();
	},
	// return the average area of the elements
	getAvgElementSize : function(elements) {
		var totSize = 0;
		var validElements = 0;
		for (var i = 0; i < elements.length; i++) {
			totSize += this.getArea(elements[i]);
			if (this.getArea(elements[i]) > Modularizer.MIN_AREA)
				validElements++;
		}
		return totSize / validElements;
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
		
		//pass the css of the original parents to the modules
		/**
		$('.module_Modulr').each(function() {
			if ($(this).parent()[0] == undefined)
				return;
			origCSS = $(this).parent().css(Modularizer.allCSS);
			console.log(origCSS);
			$(this).css(origCSS);
		});
		**/
		
		
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
			module.wrap('<p class="module_Modulr" id = "unset" />');
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
			
			//is the module or its children big enough?
			if (this.getArea(module) < this.MIN_AREA) {
				console.log("The area of this module is too small so checking the children")
				var tooSmall = true;
				console.log(Modularizer.getArea(module));
				$(module).find('*').each(function() {
					if (!tooSmall)
						return;
					console.log(Modularizer.getArea(this[0]));
					if (Modularizer.getArea(this[0]) > Modularizer.MIN_AREA)
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

				for (var i = 0; i < newModules.length; i++) {
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
				for (var i = 0; i < newModules.length; i++) {
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
				console.log("successfully adding the module")
				newModules.push(module);
				continue;
			}

			//if the only children are excluded children, don't add the module
			if ($(module).find(this.ExcludedString).length === $(module).find('*').length) {
				console.log("all children excluded");
				continue;

			}
			
			var textLength = $(module).text().length;
			/** I commented this code out because it is adding dynamically changing content as the children, creating
			 * problems for the modularizer 
			 */		
			//if the children have a longer aggregate text length or the children have an aggregate text length that is close to the original AND if the area of the module is less than the total area of the children
			// or if the children are within 0.1 of the original parent area
			//add them for processing
			/***
			if (textLength > 0 && $(module).children().length > 0) {
				if (($(module).children(this.SplitString).text().length > textLength || Math.abs($(module).children(this.SplitString).text().length - textLength) < 0.1 * textLength) && (this.getArea(module) < this.getTotalArea($(module).children().toArray()) || Math.abs(this.getArea(module) - this.getTotalArea($(module).children().toArray())) < 0.1 * this.getArea(module))) {
					console.log("adding the children...");
					$(module).children(this.SplitString).each(function() {
						console.log("child: ");
						console.log(this);
						console.log(Modularizer.getArea(this));
						modules.push(this);
					});
					continue;
				}
			}
			**/

			//is any dimension of the module too small and is the module without text or images?
			if ($(module).height() < this.MIN_DIMENSION || $(module).width() < this.MIN_DIMENSION) {
				hasImg = ((module.tagName == "IMG") || ($(module).find("img").length > 0) || (module.tagName == "A") || ($(module).find("a").length > 0))
				if (!hasImg) {
					totText = $(module).text()
					$(module).find('*').not(this.ExcludedString).each(function() {
						totText += $(this).text()
					})
					if (totText.length == 0) {
						continue;
					}
				}
			}

			console.log("successfully adding the module")
			newModules.push(module);
		}
		return newModules;
	}
};

$(document).ready(function() {
	Modulr.process(document);
});
