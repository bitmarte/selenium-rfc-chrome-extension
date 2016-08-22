// browser actions
window.gotourl_browseraction = "GO_TO_URL";
window.click_browseraction = "CLICK";
window.set_browseraction = "SET";
window.scroll_browseraction = "SCROLL";
window.windowresize_browseraction = "WINDOW_RESIZE";
window.successconditionequals_browseraction = "SUCCESS_CONDITION_EQUALS";
window.successconditioncontains_browseraction = "SUCCESS_CONDITION_CONTAINS";

// runtime variables
window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";
window.recState;
window.dimension_w = "";
window.dimension_h = "";
window.actions = [];

chrome.history.onVisited.addListener(function(historyItem) {
    if(window.recState) {
        chrome.history.getVisits({"url":historyItem.url}, function(visitItems){
            var visitItem = visitItems[visitItems.length-1];
            if(visitItem.transition == 'typed') {
                console.log('Go to url ['+historyItem.url+']');
                pushAction({
                    "browserAction" : window.gotourl_browseraction,
                    "url" : historyItem.url
                });
            }
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab){
    toggleRec();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    window.xpathOfSelectedElement = request.xPath;
    switch(request.message) {
        case "onContextMenuClick":
            window.contentOfSelectedElement = request.content;
            break;
        case "onClick":
            console.log('Click on element ['+window.xpathOfSelectedElement+']');
            pushAction({
                "browserAction" : window.click_browseraction,
                "xpath": window.xpathOfSelectedElement
            });
            break;
        case "onChange":
            window.contentOfSelectedElement = request.content;
            console.log('Set value ['+window.contentOfSelectedElement+'] on element ['+window.xpathOfSelectedElement+']');
            pushAction({
                "browserAction" : window.set_browseraction,
                "xpath": window.xpathOfSelectedElement,
                "content": window.contentOfSelectedElement
            });
            break;
        case "onScroll":
            window.contentOfSelectedElement = request.content;
            console.log('scroll on element xpath ['+window.xpathOfSelectedElement+'], top ['+request.top+'] left['+request.left+']');
            pushAction({
                "browserAction" : window.scroll_browseraction,
                "xpath": window.xpathOfSelectedElement,
                "top": request.top,
                "left": request.left
            });
            break;
        case "recState":
            sendResponse({recState:window.recState});
            break;
        default:
            break;
    }
});

function pushAction(action) {
    chrome.windows.getCurrent(function(w) {
        if(w.width != window.dimension_w || w.height != window.dimension_h) {
            console.log('resize window: ['+w.width+'x'+w.height+']');
            window.dimension_w = w.width;
            window.dimension_h = w.height;
            window.actions.push({
                "browserAction" : window.windowresize_browseraction,
                "width": window.dimension_w,
                "height": window.dimension_h
            });
        }
        window.actions.push(action);
        //fields reset
        console.log("reset xpathOfSelectedElement and contentOfSelectedElement");
        window.xpathOfSelectedElement = "";
        window.contentOfSelectedElement = "";

        buildContextMenu();
    });
}

function toggleRec() {
    if(window.recState) {
        if(window.actions.length > 0) {
            var onStopRequest = confirm(chrome.i18n.getMessage("onStopRequest_msg"));
            if (onStopRequest) {
                chrome.browserAction.setBadgeText({"text":""});
                console.log('Stop recording');
                console.log(JSON.stringify(window.actions));
                //Download plan
                chrome.downloads.download(
                    {
                        "url": URL.createObjectURL(new Blob([JSON.stringify(window.actions)])),
                        "filename": "my-plan.json",
                        "saveAs": true,
                        "headers": [
                            {
                                "name": "Content-Type",
                                "value": "application/json"
                            }
                        ]
                    }
                );
                //reset window size
                console.log("reset window dimension");
                window.dimension_w = "";
                window.dimension_h = "";
                window.recState = !window.recState;
            }
        } else {
            chrome.browserAction.setBadgeText({"text":""});
            console.log('Stop recording');
            //reset window size
            console.log("reset window dimension");
            window.dimension_w = "";
            window.dimension_h = "";
            window.recState = !window.recState;
        }
    } else {
        window.actions = [];
        chrome.browserAction.setBadgeText({"text":"rec"});
        console.log('Start recording...');
        window.recState = !window.recState;
    }
    buildContextMenu();
}