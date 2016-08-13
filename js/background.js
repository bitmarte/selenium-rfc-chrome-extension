window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";
window.recState;

chrome.history.onVisited.addListener(function(historyItem) {
    chrome.history.getVisits({"url":historyItem.url}, function(visitItems){
        var visitItem = visitItems[visitItems.length-1];
        if(visitItem.transition == 'typed') {
            console.log('Go to url ['+historyItem.url+']');
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    window.xpathOfSelectedElement = request.xPath;
    switch(request.message) {
        case "onContextMenuClick":
            window.contentOfSelectedElement = request.content;
            break;
        case "onClick":
            console.log('Click on element ['+window.xpathOfSelectedElement+']');
            break;
        case "onChange":
            window.contentOfSelectedElement = request.content;
            console.log('Set value ['+window.contentOfSelectedElement+'] on element ['+window.xpathOfSelectedElement+']');
            break;
        default:
            break;
    }
});

function conttextMenuHandler(info, tab) {
    switch(info.menuItemId) {
        case "recStateStart":
            chrome.browserAction.setBadgeText({"text":"rec"});
            window.recState = true;
            console.log('Start recording...');
            break;
        case "recStateStop":
            chrome.browserAction.setBadgeText({"text":""});
            window.recState = false;
            console.log('Stop recording');
            break;
        case "recSuccessConditionContentContains":
            window.contentOfSelectedElement = prompt("Check if contains: ", window.contentOfSelectedElement);
            console.log('Success condition on element ('+window.xpathOfSelectedElement+') that contains ['+window.contentOfSelectedElement+']');
            break;
        case "recSuccessConditionContentEquals":
            window.contentOfSelectedElement = prompt("Check if equals: ", window.contentOfSelectedElement);
            console.log('Success condition on element ('+window.xpathOfSelectedElement+') that equals ['+window.contentOfSelectedElement+']');
            break;
        default:
            chrome.browserAction.setBadgeText({"text":""});
            window.recState = false;
            console.log('Stop recording');
            break;
    }
    buildContextMenu();
};

chrome.contextMenus.onClicked.addListener(conttextMenuHandler);
chrome.runtime.onInstalled.addListener(function() {
    chrome.browserAction.setBadgeBackgroundColor({"color":"#BF0B0B"});
    buildContextMenu();
});

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
    } else {
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_RecStateStart"),
            "type" : "normal",
            "id" : "recStateStart",
            "contexts" : [ "all" ]
        });
    }
    
}