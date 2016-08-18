document.oncontextmenu = function(e) {
	e = e || window.event;
	var target = e.target || e.srcElement;
	chrome.runtime.sendMessage({
		message : "onContextMenuClick",
		xPath : getXpath(target),
		content : target.textContent
	});

	return true;
}

document.addEventListener("click", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			console.log('click on xpath: '+getXpath(target));
			chrome.runtime.sendMessage({
				message : "onClick",
				xPath : getXpath(target)
			});
		}
	});
});

document.addEventListener("change", function(e){
	chrome.runtime.sendMessage({message:"recState"}, function(response){
		if(response.recState) {
		    e = e || window.event;
			var target = e.target || e.srcElement;
			console.log('set value on xpath: '+getXpath(target)+' | content: '+target.value);
			chrome.runtime.sendMessage({
				message : "onChange",
				xPath : getXpath(target),
				content: e.target.value
			});
		}
	});
});

function getXpath(e) {
	var xpaths = [];
	//push xpath into array, calling different xpath-finder implementations
	xpaths.push(getElementInfo_Custom(e));
	xpaths.push(getElementInfo_Moz(e));

	//TODO choose the best xpath!

	return xpaths[0];
}