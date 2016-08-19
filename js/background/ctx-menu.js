function buildContextMenu() {
    chrome.contextMenus.removeAll();
    if (window.recState) {
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_RecStateStop"),
            "type" : "normal",
            "id" : "recStateStop",
            "contexts" : [ "all" ]
        });
        if(window.actions.length > 0) {
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
                "title" : chrome.i18n.getMessage("ctxMenu_RemoveLastAction"),
                "type" : "normal",
                "id" : "removeLastAction",
                "contexts" : [ "all" ]
            });

            if(window.actions[window.actions.length-1].xpath && window.actions[window.actions.length-1].xpath.length > 1) {
                chrome.contextMenus.create({
                    "title" : chrome.i18n.getMessage("ctxMenu_ChangeXpathElementExtrator"),
                    "type" : "normal",
                    "id" : "changeXpathElementExtrator",
                    "contexts" : [ "all" ]
                });
                window.actions[window.actions.length-1].xpath.forEach(function(item, index) {
                    chrome.contextMenus.create({
                        "parentId" : "changeXpathElementExtrator",
                        "title" : window.actions[window.actions.length-1].browserAction+': '+item,
                        "type" : "radio",
                        "checked" : index === 0,
                        "id" : "changeXpathElementExtrator_"+index,
                        "contexts" : [ "all" ]
                    });
                });
            }
        }
    } else {
        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("ctxMenu_RecStateStart"),
            "type" : "normal",
            "id" : "recStateStart",
            "contexts" : [ "all" ]
        });
    }
    chrome.contextMenus.create({
        "title" : chrome.i18n.getMessage("ctxMenu_ShowXpathSelectedElement"),
        "type" : "normal",
        "id" : "showXpathSelectedElement",
        "contexts" : [ "all" ]
    });
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
                pushAction({
                    "browserAction" : window.successconditioncontains_browseraction,
                    "xpath": window.xpathOfSelectedElement,
                    "content": window.contentOfSelectedElement
                });
            }
            break;
        case "recSuccessConditionContentEquals":
            var inputValue = prompt(chrome.i18n.getMessage("ctxMenu_SuccessCondition_Equals_prompt"), window.contentOfSelectedElement);
            if(inputValue !== null || inputValue === true) {
                window.contentOfSelectedElement = inputValue;
                console.log('Success condition on element ('+window.xpathOfSelectedElement+') that equals ['+window.contentOfSelectedElement+']');
                pushAction({
                    "browserAction" : window.successconditionequals_browseraction,
                    "xpath": window.xpathOfSelectedElement,
                    "content": window.contentOfSelectedElement
                });
            }
            break;
        case "removeLastAction":
            console.log('remove last recorded action');
            window.actions.pop();
            break;
        case "showXpathSelectedElement":
            var xpathString = "";
            if(window.xpathOfSelectedElement.length > 1) {
                window.xpathOfSelectedElement.forEach(function(item, index) {
                    xpathString += ' '+(index+1)+': '+item;
                });
            } else if(window.xpathOfSelectedElement.length == 1) {
                xpathString = window.xpathOfSelectedElement[0];
            } else {
                xpathString = chrome.i18n.getMessage("noXpathForElement_msg");
            }
            //TODO: copy into clickboard
            prompt(chrome.i18n.getMessage("ctxMenu_ShowXpathSelectedElement"), xpathString);
            break;
        default:
            if(info.menuItemId.startsWith('changeXpathElementExtrator_')) {
                var i = info.menuItemId.substring(info.menuItemId.indexOf('_')+1);
                var el = window.actions[window.actions.length-1].xpath[i];
                window.actions[window.actions.length-1].xpath.splice(i, 1);
                window.actions[window.actions.length-1].xpath.splice(0, 0, el);
            }
            else {
                console.log('No reg action!');
            }
            break;
    }
    buildContextMenu();
};

chrome.contextMenus.onClicked.addListener(conttextMenuHandler);