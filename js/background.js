window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";
window.recState;
window.actions = [];

chrome.history.onVisited.addListener(function(historyItem) {
    if(window.recState) {
        chrome.history.getVisits({"url":historyItem.url}, function(visitItems){
            var visitItem = visitItems[visitItems.length-1];
            if(visitItem.transition == 'typed') {
                console.log('Go to url ['+historyItem.url+']');
                pushAction('GO_TO_URL', historyItem.url);
            }
        });
    }
});

chrome.browserAction.onClicked.addListener(function(tab){
    toggleRec();
    if(window.recState) {
        chrome.windows.get(tab.windowId, function(w) {
            console.log('window size: ['+w.width+'x'+w.height+']');
            //TODO pushAction for resizing window
        }); 
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    window.xpathOfSelectedElement = request.xPath;
    switch(request.message) {
        case "onContextMenuClick":
            window.contentOfSelectedElement = request.content;
            break;
        case "onClick":
            console.log('Click on element ['+window.xpathOfSelectedElement+']');
            pushAction('CLICK');
            break;
        case "onChange":
            window.contentOfSelectedElement = request.content;
            console.log('Set value ['+window.contentOfSelectedElement+'] on element ['+window.xpathOfSelectedElement+']');
            pushAction('SET');
            break;
        case "recState":
            sendResponse({recState:window.recState});
            break;
        default:
            break;
    }
});

function pushAction(actionName, content, xpath) {
    window.actions.push({
        "browserAction" : actionName,
        "xpath": window.xpathOfSelectedElement || xpath,
        "content": window.contentOfSelectedElement || content
    });
    //fields reset
    window.xpathOfSelectedElement = "";
    window.contentOfSelectedElement = "";

    buildContextMenu();
}

function toggleRec() {
    if(window.recState) {
        chrome.browserAction.setBadgeText({"text":""});
        console.log('Stop recording');
        if(window.actions.length > 0) {
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
        }
    } else {
        window.actions = [];
        chrome.browserAction.setBadgeText({"text":"rec"});
        console.log('Start recording...');
    }
    window.recState = !window.recState;
    buildContextMenu();
}