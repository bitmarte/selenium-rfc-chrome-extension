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

function conttextMenuHandler(info, tab) {
    switch(info.menuItemId) {
        case "recStateStart":
            toggleRec();
            break;
        case "recStateStop":
            toggleRec();
            break;
        case "recSuccessConditionContentContains":
            var inputValue = prompt(chrome.i18n.getMessage("ctxMenu_SuccessCondition_Contains_prompt"), window.contentOfSelectedElement);
            if(inputValue !== null || inputValue === true) {
                window.contentOfSelectedElement = inputValue;
                console.log('Success condition on element ('+window.xpathOfSelectedElement+') that contains ['+window.contentOfSelectedElement+']');
                pushAction('SUCCESS_CONDITION_CONTAINS');
            }
            break;
        case "recSuccessConditionContentEquals":
            var inputValue = prompt(chrome.i18n.getMessage("ctxMenu_SuccessCondition_Equals_prompt"), window.contentOfSelectedElement);
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