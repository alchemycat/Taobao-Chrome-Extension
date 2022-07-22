window.onload = () => {
  (async () => {
    const href = location.href;
    // chrome.runtime.sendMessage({ type: "GET_SHOP_ID" });
    if (/(taobao|tmall)\.com\/category/.test(href)) {
      let lastUrl = location.href;

      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          scrape();
        }
      }).observe(document, { subtree: true, childList: true });
    }

    async function scrape() {
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

      if (!clickResult) {
        console.log("script end, pls save data");
      }
      //Таймаут
      await sleep(5000);
    }

    function collectData() {
      return new Promise((resolve, reject) => {
        try {
          const items = document.querySelectorAll(".item");
          const collectedData = [];

          items.forEach((item) => {
            const id = item.getAttribute("data-id");
            const title = item.querySelector(".item-name").textContent;
            const photo = item.querySelector(".photo img").src;
            const price = item.querySelector(".c-price").textContent;
            const sales = item.querySelector(".sale-num").textContent;
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
              category: href,
              price: price,
            });
          });

          resolve(collectedData);
        } catch (err) {
          reject(err);
        }
      });
    }

    function nextPage() {
      return new Promise((resolve, reject) => {
        const nextButton = document.querySelector(
          'a[trace="srp_bottom_pagedown"]'
        );

        if (!nextButton) {
          reject(false);
        }

        nextButton.click();
        resolve(true);
      });
    }

    function sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);
      });
    }
  })();
};
