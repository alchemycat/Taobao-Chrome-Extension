async function scraper() {
  //Додаємо на сторінку повідомлення про стан збереження в таблицю
  addCSS("assets/alert/alert.css");

  //зберігаємо таймаут
  let timeout = await getStorageData("timeout");
  timeout = parseInt(timeout);

  const body = document.querySelector("body");

  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modalContainer");

  const modal = document.createElement("div");
  modal.classList.add("sheetsContent");
  modal.id = "sheetsPopup";

  const close = document.createElement("button");
  close.classList.add("close");
  close.textContent = "✖";
  modal.append(close);

  const img = document.createElement("img");
  img.src = "https://cdn-icons-png.flaticon.com/512/281/281761.png";
  modal.append(img);

  const p = document.createElement("p");
  p.textContent = "Парсинг завершено, всі дані збережено до таблиці";
  modal.append(p);

  const button = document.createElement("button");
  button.classList.add("accept");
  button.textContent = "Продовжити";

  modalContainer.append(modal);
  modal.append(button);

  body.append(modalContainer);
  body.style.overflow = "hidden";

  //зберігаємо shopId
  const shopId = document.querySelector("div[shopId]").getAttribute("shopId");

  let tabId = await (() => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "GET_TAB_ID" }, (response) => {
        if (response) {
          return resolve(response);
        }
      });
    });
  })();

  const tabData = await getStorageData(tabId);

  if (tabData && tabData.status) {
    const category = tabData.data[0][7];
    await sleep(timeout);
    scrapeData(shopId, tabId, category);
  }

  chrome.runtime.onMessage.addListener(async (response) => {
    //Тут чекаємо на повідомлення чи потрібно починати парсити
    if (response.type == "START_SCRAPE") {
      const category = prompt("Назва категорії");

      if (!category) {
        return;
      }
      chrome.storage.local.set({ [tabId]: { data: [], status: true } });
      scrapeData(shopId, tabId, category);
    }
  });

  async function scrapeData(shopId, tabId, category) {
    try {
      //Збір даних
      const collectedData = await collectData(category);
      //Отримання даних які були зібрані раніше
      let previousData = await getStorageData(tabId);
      previousData = previousData.data;

      //Об'єднання старих і нових даних
      const mergedData = previousData.concat(collectedData);
      //Збереження даних
      chrome.storage.local.set({
        [tabId]: { data: mergedData, status: true },
      });

      //Наступна сторінка
      await nextPage();
    } catch (err) {
      const lastData = await getStorageData(tabId);
      //Відправляємо дані до background
      chrome.runtime.sendMessage({
        type: "SAVE_DATA",
        json: lastData.data,
        list: "scrapeList",
        script: "scrape",
        shopId: shopId,
      });

      chrome.storage.local.remove(tabId.toString());
    }
  }
  //Збираємо дані зі сторінки в массив
  function collectData(category) {
    return new Promise((resolve, reject) => {
      try {
        const items = document.querySelectorAll(".item");
        let collectedData = [];

        items.forEach((item) => {
          try {
            // const id = item.getAttribute("data-id");
            const title = item.querySelector(".item-name").textContent;
            let photo = item.querySelector(".photo img").src;
            let url = item.querySelector(".photo a").href;
            const price = item.querySelector(".c-price").textContent;
            const sales = item.querySelector(".sale-num").textContent;
            photo = photo.replace(/(https:\/\/|http:\/\/)/, "");
            let keys = title
              .replace(
                /(\s|)((\p{Script=Han}+|)(\s|))\p{Script=Han}+(\s|)/gu,
                " | "
              )
              .replace(/(?<=(\w|\W))\p{Script=Han}+(?=(\w|\W))/gu, " | ")
              .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

            collectedData.push([
              ,
              url,
              shopId,
              title,
              sales,
              keys,
              photo,
              category,
              price,
            ]);
          } catch (err) {
            console.log(err);
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
