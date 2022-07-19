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
      "https://script.google.com/macros/s/AKfycbxeABBmD4eaoIgmw82OXHSJpQ1FPpxGH4loq6a6MwZvPRRiRKQ4HCzOmP-6UDdVBDyAkw/exec",
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
