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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.json) {
    const spreadsheetList = await getStorageData("list");

    const itemIndex = spreadsheetList.findIndex((elem) => elem.selected);

    const item = spreadsheetList[itemIndex];

    const { spreadsheetLink, postLink } = item;

    fetch(postLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: spreadsheetLink, body: request.json }),
    }).then((response) => {
      console.log(response);
    });
  }
});

function getStorageData(sKey) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(sKey, function (items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}
