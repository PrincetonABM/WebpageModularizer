Array.prototype.swap=function(a, b)
        {
	var tmp=this[a];
	this[a]=this[b];
	this[b]=tmp;
        };

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
        for (var i = 0; i < allTag.length; i++)
        {
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
        while (allBases.length !== 0)
        {
            var current = allBases.eq(0);
            allBases = allBases.not(current);/*
            if (allBases.find(current).length > 0){
                continue;
            }*/
            
            // Continue if current is a descendant of any member of allBases
            if (allBases.find(current).length !== 0)
                continue;
            
            // Only consider the elements which take up space on the page
            if (current.height() * current.width() === 0 || (current.text() === "" 
                && current.find('img').length === 0))
                continue;
            
            var siblings = current.siblings(tagString);
            
            // If current has siblings
            if (siblings.length > 0){
               /* if (siblings.find(allBases.not(siblings)))
                    continue;*/
                
                // Find the number of siblings which have the same tag as current
                var sameTagged = 0;
                for (var i = 0; i < siblings.length; i++){
                    if (siblings.eq(i).prop('tagName') === current.prop('tagName'))
                    {
                        sameTagged++;
                    }
                }
                
                // If the fraction is below the grouping threshold make current and all its siblings modules
                if (sameTagged / siblings.length < this.GROUP_THRESHOLD &&
                    current.width()* current.height() > this.MIN_AREA){
                    modules = modules.add(current);
                    modules = modules.add(siblings);
                }
                
                // Otherwise add the parent as a module if its area is above the maximum allowed area
                // or add the parent back to the elements being considered by the loop
                else{
                    if (current.parent().width()* current.parent().height() > this.MAX_AREA)
                    {
                        modules = modules.add(current.parent());
                    }
                    else
                    {
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
                else{
                    if (current.parent().width()* current.parent().height() > this.MAX_AREA)
                    {
                        modules = modules.add(current.parent());
                    }
                    else{
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

var Modulr = {
	process : function(doc) {
		Splitter.split(document);
		Modulr.test(document);
	}
};

$(document).ready(function() {
    $('a').bind('click', function(e){
        e.preventDefault();
    });
    
    var modules = Modularizer.modularize(document);
    
    modules.fadeTo('slow', .5);
    modules.mouseenter(function (e) {
        $(this).fadeTo('fast', 1);
        $(this).siblings().fadeTo("fast", .7);
        return false;
    });
    modules.mouseleave(function (e) {
        $(this).fadeTo('fast', .5);
        $(this).siblings().fadeTo("fast", .5);
    });
    modules.click(function(e) {
        if (e.ctrlKey) {
            $(this).siblings().remove();
        }
        $(this).remove();
        return false;
    });
});