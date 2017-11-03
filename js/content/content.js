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

document.addEventListener("click", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			var xpaths = getXpaths(target);
			console.log('click on xpath: '+ xpaths);
			chrome.runtime.sendMessage({
				message : "onClick",
				xPath : xpaths
			});
		}
	});
});

document.addEventListener("dblclick", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			var xpaths = getXpaths(target);
			console.log('dblclick on xpath: '+ xpaths);
			chrome.runtime.sendMessage({
				message : "onDblClick",
				xPath : xpaths
			});
		}
	});
});

document.addEventListener("change", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			var xpaths = getXpaths(target);
			console.log('set value on xpath: '+xpaths+' | content: '+target.value);
			chrome.runtime.sendMessage({
				message : "onChange",
				xPath : xpaths,
				content: e.target.value
			});
		}
	});
});

document.addEventListener("scroll", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target.scrollingElement || e.srcElement.scrollingElement;
			var xpaths = getXpaths(target);
			console.log('scroll on element xpath ['+xpaths+'], top ['+e.target.scrollingElement.scrollTop+'] left['+e.target.scrollingElement.scrollLeft+']');
			chrome.runtime.sendMessage({
				message : "onScroll",
				xPath : xpaths,
				top : e.target.scrollingElement.scrollTop,
				left : e.target.scrollingElement.scrollLeft
			});
		}
	});
});

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