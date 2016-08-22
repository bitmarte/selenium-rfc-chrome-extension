document.oncontextmenu = function(e) {
	e = e || window.event;
	var target = e.target || e.srcElement;
	chrome.runtime.sendMessage({
		message : "onContextMenuClick",
		xPath : getXpaths(target),
		content : target.textContent
	});

	return true;
}

document.addEventListener("click", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			console.log('click on xpath: '+getXpaths(target));
			chrome.runtime.sendMessage({
				message : "onClick",
				xPath : getXpaths(target)
			});
		}
	});
});

document.addEventListener("change", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			console.log('set value on xpath: '+getXpaths(target)+' | content: '+target.value);
			chrome.runtime.sendMessage({
				message : "onChange",
				xPath : getXpaths(target),
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
			console.log('scroll on element xpath ['+getXpaths(target)+'], top ['+e.target.scrollingElement.scrollTop+'] left['+e.target.scrollingElement.scrollLeft+']');
			chrome.runtime.sendMessage({
				message : "onScroll",
				xPath : getXpaths(target),
				top : e.target.scrollingElement.scrollTop,
				left : e.target.scrollingElement.scrollLeft
			});
		}
	});
});

// return unique elements in the array, contains different xpath for the same element based on the implementation
function getXpaths(e) {
	var xpaths = [];
	xpaths.push(getElementInfo_Custom(e));
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

	return uniqueXpaths(xpaths);
}