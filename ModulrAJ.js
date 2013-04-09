$(document).ready(function() {
    function getBaseElements(tag) {
        var bases = $();
        var allTag = $(tag);
        for (var i = 0; i < allTag.length; i++)
        {
            if (allTag.eq(i).children(tag).length === 0)
                bases = bases.add(allTag.eq(i));
        }
        return bases;
    }
    $('a').bind('click', function(e){
        e.preventDefault();
    });
    var GROUP_THRESHOLD = .8;
    var tags = ['div', 'p', 'span', 'img', 'ol', 'ul', 'a'];
    var allBases = $();
    var modules = $();
    var tagString = tags[0];
    for (var i = 1; i < tags.length; i++)
        tagString += ", " + tags[i];
    allBases = getBaseElements(tagString);
    while (allBases.length !== 0)
    {
        var current = allBases.eq(0);
        allBases = allBases.not(current);
        if (allBases.find(current).length !== 0)
            continue;
        if (current.height() * current.width() === 0)
            continue;
        var siblings = current.siblings();
        if (siblings.length > 0){
            var sameTagged = 0;
            for (var i = 0; i < siblings.length; i++){
                if (siblings.eq(i).prop('tagName') === current.prop('tagName'))
                {
                    sameTagged++;
                }
            }
            if (sameTagged / siblings.length < GROUP_THRESHOLD){
                modules = modules.add(current);
                modules = modules.add(siblings);
            }
            else{
                if (current.parent().width()* current.parent().height() > 1000)
                    modules = modules.add(current.parent());
                else
                    allBases = allBases.add(current.parent());
            }
            allBases = allBases.not(siblings);
        }
        else {
            if (current.parent().prop('tagName').toLowerCase() === 'body')
                modules = modules.add(current);
            else{
                if (current.parent().width()* current.parent().height() > 1000)
                    modules = modules.add(current.parent());
                else
                    allBases = allBases.add(current.parent());
            }
        }
    }
    for (var i = 0; i < modules.length; i++)
        if (modules.not(modules.eq(i)).find(modules.eq(i)).length !== 0)
        {
            modules = modules.not(modules.eq(i));
            i--;
        }
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