async function scraper() {
  chrome.runtime.sendMessage({ type: "GET_TAB_ID" });

  let timeout = await getStorageData("timeout");
  timeout = parseInt(timeout);

  //зберігаємо shopId
  const shopId = document.querySelector("div[shopId]").getAttribute("shopId");
  console.log(`shopID: ${shopId}`);

  chrome.runtime.onMessage.addListener(async (response) => {
    //Тут чекаємо на повідомлення чи змінилась сторінка
    if (response.type == "START_SCRAPE") {
      const tabId = response.tabId;

      console.log(`sender id: ${tabId}`);

      console.log("start");

      chrome.storage.local.set({ [tabId]: { data: [], status: true } });

      scrapeData(shopId, tabId);
    }
    if (response.type == "TAB_ID") {
      const tabId = response.tabId;
      console.log(`current tabid: ${tabId}`);
      try {
        let isStart = await getStorageData(tabId);
        console.log(`tabid data: ${isStart}`);
        if (isStart) {
          if (isStart.status) {
            scrapeData(shopId, tabId);
          } else {
            const lastData = await getStorageData(tabId);
            //Відправляємо дані до background
            chrome.runtime.sendMessage({
              type: "SAVE_DATA",
              json: lastData.data,
              list: "scrapeList",
            });
            console.log(`tabid before remove: ${tabId}`);
            chrome.storage.local.remove(tabId);
            console.log("scraper off");
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  });

  async function scrapeData(shopId, tabId) {
    try {
      console.log("scraping started");
      //Збір даних
      const collectedData = await collectData();

      //Отримання даних які були зібрані раніше
      const previousData = await getStorageData(tabId);

      //Об'єднання старих і нових даних
      const mergedData = previousData.data.concat(collectedData);
      console.log(`merged data: ${mergedData}`);
      //Збереження даних
      chrome.storage.local.set({ [tabId]: { data: mergedData, status: true } });

      //Наступна сторінка
      await sleep(timeout);
      await nextPage();
    } catch (err) {
      console.log(err);
      const lastData = await getStorageData(tabId);
      //Відправляємо дані до background
      chrome.runtime.sendMessage({
        type: "SAVE_DATA",
        json: lastData.data,
        list: "scrapeList",
      });
      console.log(`tabid before remove: ${tabId}`);
      chrome.storage.local.remove(tabId);
      console.log("script end, data saved");
    }
  }
  //Збираємо дані зі сторінки в массив
  function collectData() {
    return new Promise((resolve, reject) => {
      try {
        const items = document.querySelectorAll(".item");
        const collectedData = [];

        items.forEach((item) => {
          try {
            const id = item.getAttribute("data-id");
            const title = item.querySelector(".item-name").textContent;
            const photo = item.querySelector(".photo img").src;
            const price = item.querySelector(".c-price").textContent;
            const sales = item.querySelector(".sale-num").textContent;

            // console.log(
            //   `title: ${title}\nphoto: ${photo}\nprice: ${price}\nsales: ${sales}`
            // );

            let keys = title
              .replace(
                /(\s|)((\p{Script=Han}+|)(\s|))\p{Script=Han}+(\s|)/gu,
                " | "
              )
              .replace(/(?<=(\w|\W))\p{Script=Han}+(?=(\w|\W))/gu, " | ")
              .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

            collectedData.push({
              url: `https://item.taobao.com/item.htm?id=${id}`,
              shop: shopId,
              title: title,
              sales: sales,
              keys: keys,
              photo: photo,
              category: location.href,
              price: price,
            });
          } catch {
            return;
          }
        });

        resolve(collectedData);
      } catch (err) {
        reject(err);
      }
    });
  }
}
