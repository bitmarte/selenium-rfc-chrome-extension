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