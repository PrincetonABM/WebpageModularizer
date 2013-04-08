var Cleaner = {
	clean : function(doc) {
		$("script").remove();
		$("meta").remove();
	}
};

var Splitter = {

	// Tags that should be divided by
	SplitTags : ["MAP", "ARTICLE", "CANVAS", "DIV", "FIGURE", "FOOTER", "HEADER", "IMG", "P", "SECTION", "SPAN", "OL", "UL"],
	//Tags that affect text font that should not be divided by
	DescriptiveTags : ["FONT", "B", "I", "STRONG", "EM", "SUB", "SUP", "CODE"],
	//Tags that must not be contained within modules
	ExcludedTags : ["SCRIPT"],
	//the maximum single branch length for a module
	MAX_BRANCH_LEN : 5,
	// min pixel area for a module
	MIN_AREA : 1000,
	// max pixel area for a module
	MAX_AREA : 500000,

	//tests if every node until the end has only one child
	isSingleBranch : function(node) {
		var branchCrawler = node.cloneNode(true);
		var len = 0;
		while (branchCrawler.children != null) {
			if (branchCrawler.children.length == 0) {
				return len;
			}
			if (branchCrawler.children.length > 1) {
				return -1;
			}
			len++;
			branchCrawler = branchCrawler.children[0];
		}
		console.log("branch crawler's children are null");
		return len;
	},

	// splits a document into assorted modules by wrapping each module with div tags
	split : function(doc) {
		var body = doc.getElementsByTagName("html")[0].children[1];
		//alternate storing in the two queues so the nodes can be partitioned by level
		var nodesA = new Array();
		var nodesB = new Array();
		var curQueue = 'A';
		nodesA.push(body);

		do {
			if (curQueue == 'A') nodesB = this.partition(nodesA).slice(0);
			else   				 nodesA = this.partition(nodesB).slice(0);
			
			curQueue = (curQueue == 'A') ? 'B' : 'A';
		} while ((nodesB.length > 0) || (nodesA.length > 0));
		console.log(body);
	},

	// takes the nodes on a level of the DOM tree and partitions it into modules by wrapping them in
	//div tags and returns the children of the unpartitioned nodes
	partition : function(receiveQueue) {
		var targetQueue = new Array();
		// head is assigned to the first viable node
		var head = null;
		// loop through nodes and combine consecutive single branch nodes (of the right type, length, aream, and content)
		// into a single module
		for (var i = 0; i < receiveQueue.length; i++) {
			var node = receiveQueue[i];
			if (node == null) {
				if (head != null) {
					// if there is a consecutive string of viable modules of the same tag, combine them
					var jtail = $(node);
					var jhead = $(head);
					jhead.add(jhead.nextUntil(jtail, head.tagName)).wrapAll('<div class="module" />');
					head = null;
				}
				continue;
			}
			
			var branchLen = this.isSingleBranch(node);
			console.log(node);
			if ((-1 < branchLen) && (branchLen < this.MAX_BRANCH_LEN) 
				&& ($.inArray(node.tagName, this.SplitTags > -1)) 
				&& ($.inArray(node.tagName, this.ExcludedTags) < 0) 
				&& (Splitter.getArea(node) > this.MIN_AREA) 
				&& (Splitter.getArea(node) < this.MAX_AREA) 
				&& (this.isValidBranch(node))) {
				
				if (head == null) {
					// if there has been no consecutive string of viable modules
					head = node;
					if (i == (receiveQueue.length - 1)) {
						// if all nodes have been processed, just wrap this one node
						var jhead = $(head);
						jhead.wrap('<div class="module" />');
					}	
				} else if (head.tagName != node.tagName) {
					// if there has been a string of consecutive viable modules, but the tag name is different
					// combine the previous string of modules and update the head
					var jtail = $(node);
					var jhead = $(head);

					jhead.add(jhead.nextUntil(jtail, head.tagName)).wrapAll('<div class="module" />');
					head = node;
					console.log("wrapping diff tag name");
					if (i == (receiveQueue.length - 1)) {
						$(node).wrap('<div class="module" />');
					}				
				} else if (i == (receiveQueue.length - 1)) {
					var jtail = $(node);
					var jhead = $(head);
					jhead.add(jhead.nextAll(head.tagName)).wrapAll('<div class="module" />');
					head = node;
				}
				continue;
			}

			if (head != null) {
				// if there is a consecutive string of viable modules of the same tag, combine them
				var jtail = $(node);
				var jhead = $(head);
				jhead.add(jhead.nextUntil(jtail, head.tagName)).wrapAll('<div class="module" />');
				head = null;
			}
			// add the children of this unmodularizaable node
			var children = node.children;
			if (children != null) {
				for (var j = 0; j < children.length; j++) {
					targetQueue.push(children[j]);
				}
			}
		}
		//reset the receiving queue
		receiveQueue.length = 0;
		return targetQueue;
	},

	getArea : function(node) {
		var jnode = $(node);
		return jnode.height() * jnode.width();
	},

	hasText : function(node) {
		var jnode = $(node);
		return (jnode.text().trim().length > 0);
	},

	hasImg : function(node) {
		return (node.tagName == "IMG");
	},

	//returns true if some node within the singly branched node has an image or has text
	// false otherwise
	isValidBranch : function(node) {
		var branchCrawler = node.cloneNode(true);
		while (branchCrawler.children != null) {
			if (this.hasText(node) || this.hasImg(node))
				return true;

			if (branchCrawler.children.length == 0)
				return false;
			branchCrawler = branchCrawler.children[0];
		}
		return false;
	}
};

var Modulr = {
	test2 : function(doc) {
		$("p").draggable({
			snap : true
		});
		$("img").resizable({
			ghost : true
		});

		$('p').after('<button>Button</button>').button().click(function() {
			alert('I was dicked!');
		});

	},
	test : function(doc) {
		//make the bg color of modules different so they can be seen easier
		$('.module').css('background-color', '#E01B6A');
		$('.module').draggable({
			snap : true
		});

	},
	
	process : function(doc) {
		Splitter.split(document);
		Modulr.test(document);
	}
};

$(document).ready(function() {
	Modulr.process(document);
});

