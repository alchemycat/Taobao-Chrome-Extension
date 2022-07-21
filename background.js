chrome.action.onClicked.addListener(function (tab) {
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
  if (request.type == "SAVE_DATA") {
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
      if (response.status === 200) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "DELIVERY",
          message: "Дані збережено успішно",
          status: "success",
        });
      } else {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "DELIVERY",
          message: "Дані не збережено. Перевірте таблицю та вебхук",
          status: "failure",
        });
      }
    });
  }
  if (request.type == "INJECT") {
    const hotletter = await getStorageData("hotletter");
    const hotkey = await getStorageData("hotkey");

    chrome.scripting.executeScript({
      target: {
        tabId: sender.tab.id,
      },
      func: handleKeys,
      args: [hotletter, hotkey],
    });
  }
});

function handleKeys(hotletter, hotkey) {
  document.addEventListener(
    "keydown",
    async function (e) {
      let button;
      switch (hotkey) {
        case "Control":
          button = e.ctrlKey;
          break;
        case "Alt":
          button = e.altKey;
          break;
        default:
          button = e.ctrlKey;
          break;
      }
      if (e.key === hotletter && button) {
        e.preventDefault();
        let idNote = await prompt("Задайте idNote: ");
        if (!idNote) {
          return;
        }
        window.postMessage(
          {
            type: "SAVE",
            idNote: idNote,
          },
          "*"
        );
      }
    },
    false
  );
}

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
