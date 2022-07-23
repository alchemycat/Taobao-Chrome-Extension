document.addEventListener("DOMContentLoaded", () => {
  const url = location.href;
  //перевіряємо, якщо юрл підходить то запускаємо фільтер
  if (/taobao.com\/search\?/.test(url)) {
    filter();
  } else if (/(taobao|tmall)\.com\/category/.test(url)) {
    scraper();
  } else {
    console.log("another link");
    (async () => {
      let tabId = await (() => {
        return new Promise((resolve, reject) => {
          console.log("get tab id");
          chrome.runtime.sendMessage({ type: "GET_TAB_ID" }, (response) => {
            if (response) {
              return resolve(response);
            }
          });
        });
      })();

      console.log(`tabId: ${tabId}`);

      const lastData = await getStorageData(tabId);
      //Відправляємо дані до background
      console.log(`tab data: ${JSON.stringify(lastData)}`);
      chrome.runtime.sendMessage({
        type: "SAVE_DATA",
        json: lastData.data,
        list: "scrapeList",
      });

      chrome.storage.local.remove(tabId.toString());
      alert("scraper off");
    })();
  }
});
