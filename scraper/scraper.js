async function scraper() {
  //зберігаємо таймаут
  let timeout = await getStorageData("timeout");
  timeout = parseInt(timeout);

  //зберігаємо shopId
  const shopId = document.querySelector("div[shopId]").getAttribute("shopId");
  console.log(`shopID: ${shopId}`);

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

  const tabData = await getStorageData(tabId);

  console.log(`tabData: ${JSON.stringify(tabData)}`);

  if (tabData && tabData.status) {
    alert(`sleep: ${timeout}`);
    await sleep(timeout);
    alert("Continue scraping");
    scrapeData(shopId, tabId);
  }

  chrome.runtime.onMessage.addListener(async (response) => {
    //Тут чекаємо на повідомлення чи потрібно починати парсити
    if (response.type == "START_SCRAPE") {
      console.log("Scraping start");
      chrome.storage.local.set({ [tabId]: { data: [], status: true } });

      scrapeData(shopId, tabId);
    }
  });

  async function scrapeData(shopId, tabId) {
    console.log(`Function: scrape data`);
    try {
      //Збір даних
      const collectedData = await collectData();

      //Отримання даних які були зібрані раніше
      const previousData = await getStorageData(tabId);

      //Об'єднання старих і нових даних
      const mergedData = previousData.data.concat(collectedData);
      console.log(`Merged data: ${mergedData}`);
      //Збереження даних
      chrome.storage.local.set({ [tabId]: { data: mergedData, status: true } });

      //Наступна сторінка
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
      chrome.storage.local.remove(tabId.toString());
      alert("end scraping");
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

  //Відкриваємо наступну сторінку
  function nextPage() {
    return new Promise((resolve, reject) => {
      const nextButton = document.querySelector(".next");

      if (!nextButton) {
        reject(false);
      }

      nextButton.click();
      resolve(true);
    });
  }

  function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }
}
