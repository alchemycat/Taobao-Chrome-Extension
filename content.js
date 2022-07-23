document.addEventListener("DOMContentLoaded", () => {
  const url = location.href;
  //перевіряємо, якщо юрл підходить то запускаємо фільтер
  if (/taobao.com\/search\?/.test(url)) {
    filter();
  } else if (/(taobao|tmall)\.com\/category/.test(url)) {
    scraper();
  } else {
    chrome.runtime.sendMessage({ type: "GET_TAB_ID" });

    chrome.runtime.onMessage.addListener(async (response) => {
      if (response.type == "TAB_ID") {
        const tabId = response.tabId;
        const lastData = await getStorageData(tabId);
        //Відправляємо дані до background
        chrome.runtime.sendMessage({
          type: "SAVE_DATA",
          json: lastData.data,
          list: "scrapeList",
        });

        chrome.storage.local.remove([tabId]);
        console.log("scraper off");
      }
    });
    console.log("another link");
  }
});
