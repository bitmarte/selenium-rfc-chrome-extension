window.xpathOfSelectedElement = "";
window.contentOfSelectedElement = "";

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
        case "recSuccessConditionContentContains":
            window.contentOfSelectedElement = prompt("Check if contains: ", window.contentOfSelectedElement);
            console.log('Success condition on element ('+window.xpathOfSelectedElement+') that contains ['+window.contentOfSelectedElement+']');
            break;
        default:
            window.contentOfSelectedElement = prompt("Check if equals: ", window.contentOfSelectedElement);
            console.log('Success condition on element ('+window.xpathOfSelectedElement+') that equals ['+window.contentOfSelectedElement+']');
            break;
    }
};

chrome.contextMenus.onClicked.addListener(conttextMenuHandler);
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title" : "Record success condition",
        "type" : "normal",
        "id" : "recSuccessCondition",
        "contexts" : [ "all" ]
    });
    chrome.contextMenus.create({
        "parentId" : "recSuccessCondition",
        "title" : "Content equals...",
        "type" : "normal",
        "id" : "recSuccessConditionContentEquals",
        "contexts" : [ "all" ]
    });
    chrome.contextMenus.create({
        "parentId" : "recSuccessCondition",
        "title" : "Content contains...",
        "type" : "normal",
        "id" : "recSuccessConditionContentContains",
        "contexts" : [ "all" ]
    });
});