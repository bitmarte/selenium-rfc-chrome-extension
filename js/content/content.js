document.oncontextmenu = function(e) {
	e = e || window.event;
	var target = e.target || e.srcElement;
	var xpaths = getXpaths(target);
	chrome.runtime.sendMessage({
		message : "onContextMenuClick",
		xPath : xpaths,
		content : target.textContent
	});

	return true;
}

// return unique elements in the array, contains different xpath for the same element based on the implementation
function getXpaths(e) {
	var xpaths = [];
	xpaths.push(getElementInfo_Custom(e, false));
	xpaths.push(getElementInfo_Custom(e, true));
	xpaths.push(getElementInfo_Moz(e));
	//put here your implementation

	var uniqueXpaths = function(xs) {
		var seen = {}
		return xs.filter(function(x) {
			if (seen[x])
			return
			seen[x] = true
			return x
		});
	}

	var pureXpaths = uniqueXpaths(xpaths);
	pureXpaths.forEach(function(item, index) {
		var b = document.evaluate(item, document, null, XPathResult.ANY_TYPE, null);
		var c = b.iterateNext();
		var i = 0;
		while(c) {
			c = b.iterateNext();
			i++;
		}
		console.log('number of elements for xpath ['+item+']: '+i);
		if(i > 1) {
			console.log('remove xpath for a non unique result ['+item+']');
			pureXpaths.splice(index, 1);
		}
	});

	return pureXpaths;
}