chrome.runtime.onInstalled.addListener(() => {
  console.log("installed");
});

chrome.action.onClicked.addListener(function (tab) {
  console.log("icon clicked");
  chrome.tabs.create({
    url: "options/options.html",
  });
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   // Additionally, you can check for changeInfo.status
//   // if (/^https:\/\/s\.taobao.com/.test(tab.url)) {
//   //   chrome.action.setPopup({
//   //     tabId: tab.id, // Set the new popup for this tab.
//   //     popup: "popup.html", // Open this html file within the popup.
//   //   });
//   // }
// });
