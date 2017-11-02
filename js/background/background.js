// browser actions
window.gotourl_browseraction = "GO_TO_URL";
window.click_browseraction = "CLICK";
window.set_browseraction = "SET";
window.scroll_browseraction = "SCROLL";
window.windowresize_browseraction = "WINDOW_RESIZE";
window.successconditionequals_browseraction = "SUCCESS_CONDITION_EQUALS";
window.successconditioncontains_browseraction = "SUCCESS_CONDITION_CONTAINS";

// debouncer time (in milliseconds)
window.debouncer_time = 100;

// runtime variables
window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";
window.recState;
window.dimension_w = "";
window.dimension_h = "";
window.scroll_top = "";
window.scroll_left = "";
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
                "top": request.top-window.scroll_top,
                "left": request.left-window.scroll_left
            });
            break;
        case "recState":
            sendResponse({recState:window.recState});
            break;
        default:
            break;
    }
});

// return 0 if actions equals
function compareAction(action1, action2) {
    if(action1 !== undefined && action2 !== undefined) {
        switch(action1.browserAction) {
            case window.gotourl_browseraction:
                if(
                    action1.browserAction === window.gotourl_browseraction &&
                    action1.url === action2.url &&
                    (action2.timestamp - action1.timestamp) <= window.debouncer_time
                ) {
                    return 0;
                } else {
                    return 1;
                }
                break;

            case window.scroll_browseraction:
                // do nothing, not equals
                return 1;
                break;

            case window.windowresize_browseraction:
                if(
                    action1.browserAction === window.windowresize_browseraction &&
                    action1.width === action2.width &&
                    action1.height === action2.height &&
                    (action2.timestamp - action1.timestamp) <= window.debouncer_time
                ) {
                    return 0;
                } else {
                    return 1;
                }
                break;

            default:
                if(
                    action1.browserAction === action2.browserAction &&
                    action1.xpath[0] === action2.xpath[0] &&
                    action1.content === action2.content &&
                    (action2.timestamp - action1.timestamp) <= window.debouncer_time
                ) {
                    return 0;
                } else {
                    return 1;
                }
                break;
        }
    } else {
        return 1;
    }
}

function pushAction(action) {
    chrome.windows.getCurrent(function(w) {
        action.timestamp = Date.now();

        // debouncing
        var lastAction = window.actions[window.actions.length-1];

        // manage window resize action
        if(w.width != window.dimension_w || w.height != window.dimension_h) {
            console.log('resize window: ['+w.width+'x'+w.height+']');
            window.dimension_w = w.width;
            window.dimension_h = w.height;

            // debouncing
            if(compareAction(lastAction, action) === 0) {
                // Do nothing
                console.log('Duplicated action ['+lastAction.browserAction+'] at the same element, ignore it!');
            } else {
                window.actions.push({
                    "browserAction" : window.windowresize_browseraction,
                    "width": window.dimension_w,
                    "height": window.dimension_h,
                    "timestamp": Date.now()
                });
            }
            
        }

        // manage scroll
        if(action.browserAction === window.scroll_browseraction) {
            if(window.actions[window.actions.length-1]) {
                if(window.actions[window.actions.length-1].browserAction === window.scroll_browseraction) {
                    console.log('remove previous scroll in favour of the last one');
                    window.actions.pop();
                }
            }
        }

        // debouncing
        if(compareAction(lastAction, action) === 0) {
            // Do nothing
            console.log('Duplicated action ['+lastAction.browserAction+'] at the same element, ignore it!');
        } else {
            action.timestamp = Date.now();
            window.actions.push(action);
        }
        
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
            //last browserAction is a successCondition
            if(window.actions[window.actions.length-1].browserAction.includes("SUCCESS_CONDITION_")) {
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
                var noSuccessCondition = confirm(chrome.i18n.getMessage("onStopRequest_noSuccessCondition_msg"));
                if(noSuccessCondition) {
                    chrome.browserAction.setBadgeText({"text":""});
                    console.log('Stop recording');
                    //reset window size
                    console.log("reset window dimension");
                    window.dimension_w = "";
                    window.dimension_h = "";
                    window.recState = !window.recState;
                }
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