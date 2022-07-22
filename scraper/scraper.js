async function scraper() {
  // chrome.runtime.sendMessage({ type: "GET_SHOP_ID" });

  let lastUrl = location.href;

  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      scrapeData();
    }
  }).observe(document, { subtree: true, childList: true });

  chrome.runtime.onMessage.addListener(async (response) => {
    //Тут чекаємо на повідомлення чи змінилась сторінка
    if (response.type == "START_SCRAPE") {
      scrapeData();
    }
  });

  async function scrapeData() {
    //Збір даних
    const collectedData = await collectData();

    //Отримання даних які були зібрані раніше
    const previousData = await getStorageData(shopId);

    //Об'єднання старих і нових даних
    const mergedData = previousData.concat(collectedData);

    //Збереження даних
    chrome.storage.local({ [shopId]: mergedData });

    //Наступна сторінка
    const clickResult = await nextPage().catch((err) => {
      return false;
    });

    //перевіряємо чи виникла помилка
    if (!clickResult) {
      console.log("script end, pls save data");
    }

    //Таймаут
    await sleep(5000);
  }
}
