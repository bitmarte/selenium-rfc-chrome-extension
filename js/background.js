window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";
window.recState;
window.actions = [];

chrome.history.onVisited.addListener(function(historyItem) {
    chrome.history.getVisits({"url":historyItem.url}, function(visitItems){
        var visitItem = visitItems[visitItems.length-1];
        if(visitItem.transition == 'typed') {
            console.log('Go to url ['+historyItem.url+']');
            pushAction('GO_TO_URL', historyItem.url);
        }
    });
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

function conttextMenuHandler(info, tab) {
    switch(info.menuItemId) {
        case "recStateStart":
            toggleRec();
            break;
        case "recStateStop":
            toggleRec();
            break;
        case "recSuccessConditionContentContains":
            var inputValue = prompt("Check if contains: ", window.contentOfSelectedElement);
            if(inputValue !== null || inputValue === true) {
                window.contentOfSelectedElement = inputValue;
                console.log('Success condition on element ('+window.xpathOfSelectedElement+') that contains ['+window.contentOfSelectedElement+']');
                pushAction('SUCCESS_CONDITION_CONTAINS');
            }
            break;
        case "recSuccessConditionContentEquals":
            var inputValue = prompt("Check if equals: ", window.contentOfSelectedElement);
            if(inputValue !== null || inputValue === true) {
                window.contentOfSelectedElement = inputValue;
                console.log('Success condition on element ('+window.xpathOfSelectedElement+') that equals ['+window.contentOfSelectedElement+']');
                pushAction('SUCCESS_CONDITION_EQUALS');
            }
            break;
        case "removeLastAction":
            window.actions.pop();
            break;
        default:
            console.log('No reg action!');
            break;
    }
    buildContextMenu();
};

chrome.contextMenus.onClicked.addListener(conttextMenuHandler);
chrome.runtime.onInstalled.addListener(function() {
    window.actions = [];
    chrome.browserAction.setBadgeBackgroundColor({"color":"#BF0B0B"});
    buildContextMenu();
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

function buildContextMenu() {
    chrome.contextMenus.removeAll();
    if (window.recState) {
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_SuccessConditionMain"),
            "type" : "normal",
            "id" : "recSuccessCondition",
            "contexts" : [ "all" ]
        });
            chrome.contextMenus.create({
                "parentId" : "recSuccessCondition",
                "title" : chrome.i18n.getMessage("ctxMenu_SuccessCondition_Equals"),
                "type" : "normal",
                "id" : "recSuccessConditionContentEquals",
                "contexts" : [ "all" ]
            });
            chrome.contextMenus.create({
                "parentId" : "recSuccessCondition",
                "title" : chrome.i18n.getMessage("ctxMenu_SuccessCondition_Contains"),
                "type" : "normal",
                "id" : "recSuccessConditionContentContains",
                "contexts" : [ "all" ]
            });
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_RecStateStop"),
            "type" : "normal",
            "id" : "recStateStop",
            "contexts" : [ "all" ]
        });
        if(window.actions.length > 0) {
            chrome.contextMenus.create({
                "title" : chrome.i18n.getMessage("ctxMenu_RemoveLastAction"),
                "type" : "normal",
                "id" : "removeLastAction",
                "contexts" : [ "all" ]
            });
        }
    } else {
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_RecStateStart"),
            "type" : "normal",
            "id" : "recStateStart",
            "contexts" : [ "all" ]
        });
    }
    
}