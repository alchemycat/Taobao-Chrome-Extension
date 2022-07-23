document.addEventListener("DOMContentLoaded", () => {
  const url = location.href;
  //перевіряємо, якщо юрл підходить то запускаємо фільтер
  if (/s\.taobao.com\/search\?/.test(url)) {
    console.log("filter on");
    filter();
  }

  if (/(taobao|tmall)\.com\/category/.test(url)) {
    console.log("scraper on");
    scraper();
  }

  if (!/s\.taobao.com\/search\?/.test(url)) {
    console.log("all deactivated");
    (async () => {
      try {
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

        if (lastData) {
          console.log(`tab data: ${JSON.stringify(lastData)}`);
          chrome.runtime.sendMessage(
            {
              type: "SAVE_DATA",
              json: lastData.data,
              list: "scrapeList",
              script: "scrape",
              shopId: lastData.data[0][6],
            },
            (response) => {
              createAlert(response.text, response.status);
            }
          );

          chrome.storage.local.remove(tabId.toString());
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }
});
