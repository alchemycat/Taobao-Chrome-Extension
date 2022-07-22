async function scraper() {
  let isStart = await getStorageData("scraper");

  if (isStart) {
    // chrome.storage.local.remove(shopId);
    scrapeData();
  } else {
    console.log("scraper off");
  }

  let timeout = await getStorageData("timeout");
  timeout = parseInt(timeout);

  //зберігаємо shopId
  const shopId = document.querySelector("div[shopId]").getAttribute("shopId");
  console.log(`shopID: ${shopId}`);

  chrome.runtime.onMessage.addListener(async (response) => {
    //Тут чекаємо на повідомлення чи змінилась сторінка
    console.log("message");
    if (response.type == "START_SCRAPE") {
      console.log("start");
      chrome.storage.local.set({ scraper: true });
      scrapeData();
    }
  });

  async function scrapeData(shopId) {
    try {
      console.log("scraping started");
      //Збір даних
      const collectedData = await collectData();

      //Отримання даних які були зібрані раніше
      const previousData = await getStorageData(shopId);

      //Об'єднання старих і нових даних
      const mergedData = previousData.concat(collectedData);
      console.log(`merged data: ${mergedData}`);
      //Збереження даних
      chrome.storage.local.set({ [shopId]: mergedData });

      //Наступна сторінка
      await nextPage();
      await sleep(timeout);
    } catch {
      const lastData = await getStorageData(shopId);
      //Відправляємо дані до background
      chrome.runtime.sendMessage({
        type: "SAVE_DATA",
        json: lastData,
        list: "scrapeList",
      });
      chrome.storage.local.set({ scraper: false });
      console.log("script end, pls save data");
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
