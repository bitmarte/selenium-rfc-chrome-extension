chrome.runtime.onInstalled.addListener(function() {
    chrome.browserAction.setBadgeBackgroundColor({"color":"#BF0B0B"});
    buildContextMenu();
});