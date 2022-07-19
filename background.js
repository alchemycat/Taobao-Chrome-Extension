chrome.runtime.onInstalled.addListener(() => {
  console.log("installed");
});

chrome.action.onClicked.addListener(function (tab) {
  console.log("icon clicked");
  chrome.tabs.create({
    url: "options/options.html",
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (/taobao\.com\/search/.test(changeInfo.url)) {
    chrome.tabs.sendMessage(tabId, { type: "URL_CHANGED" });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.json) {
    fetch(
      "https://script.google.com/macros/s/AKfycbxiUibXuuMsMShKZK6meCgDqz8nGN_-eD7Sb6j65o0N4dFOItA0aoI0-MzWNFbkRcEZ3g/exec",
      {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request.json),
      }
    ).then((response) => {
      console.log(response);
    });
  }
});
