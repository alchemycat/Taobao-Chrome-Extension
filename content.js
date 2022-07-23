document.addEventListener("DOMContentLoaded", () => {
  const url = location.href;
  //перевіряємо, якщо юрл підходить то запускаємо фільтер
  if (/s\.taobao.com\/search\?/.test(url)) {
    filter();
  }

  if (/(taobao|tmall)\.com\/category/.test(url)) {
    scraper();
  } else {
    (async () => {
      try {
        let tabId = await (() => {
          return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: "GET_TAB_ID" }, (response) => {
              if (response) {
                return resolve(response);
              }
            });
          });
        })();

        const lastData = await getStorageData(tabId);
        //Відправляємо дані до background

        if (lastData) {
          chrome.runtime.sendMessage({
            type: "SAVE_DATA",
            json: lastData.data,
            list: "scrapeList",
            script: "scrape",
            shopId: lastData.data[0][2],
          });

          chrome.storage.local.remove(tabId.toString());
          showModal();
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }
});
