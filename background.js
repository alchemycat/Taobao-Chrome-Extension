//Якщо клік на іконку додатку то показуємо сторінку options.html
chrome.action.onClicked.addListener(function () {
  chrome.tabs.create({
    url: "options/options.html",
  });
});

//Якщо сторінка змінилась тоді відправляємо меседж до content.js що сторінка змінилась
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (/taobao\.com\/search/.test(changeInfo.url)) {
    chrome.tabs.sendMessage(tabId, { type: "URL_CHANGED" });
  }
});

//Слідкуємо за меседжами які приходять від content.js
chrome.runtime.onMessage.addListener(async (response, sender, sendResponse) => {
  //Якщо реквест == SAVE_DATA то потрібно зберегти дані в таблицю
  if (response.type == "SAVE_DATA") {
    //Достаємо всі таблиці які додані із chrome.storage
    const spreadsheetList = await getStorageData(response.list);
    //Далі шукаємо індекс таблиці яка має selected = true що означає вона зараз використовується за замовченням
    const itemIndex = spreadsheetList.findIndex((elem) => elem.selected);
    //Обираємо цю таблицю
    const item = spreadsheetList[itemIndex];
    //Достаємо з неї дані про webhook та посилання на саму таблицю
    const { spreadsheetLink, webhookLink } = item;
    //Робимо запит по даним які дістали
    fetch(webhookLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: spreadsheetLink,
        body: response.json,
        type: response.script,
        shopId: response.shopId,
      }), //В реквесті передаємо лінк на таблицю та json
    }).then((response) => {
      console.log(response);
      if (response.status === 200) {
        //Якщо статус код запиту 200 то відправляємо меседж до content.js що все ок і дані збережені
        sendResponse({ message: "Дані збережено успішно", status: "success" });
      } else {
        //Якщо статус код запиту не 200 то відправляємо меседж до content.js що дані не збережено
        sendResponse({
          message: "Дані не збережено. Перевірте таблицю та вебхук",
          status: "failure",
        });
      }
    });
  }
  //Якщо реквест == INJECT тоді нам потрібно додати хоткеї до сторінки
  if (response.type == "INJECT") {
    //Спочатку беремо хоткеї зі chrome.storage
    //Далі виконуємо скрипт який додасть наші хоткеї до сторінки

    const hotletter = await getStorageData("hotletter");
    const hotkey = await getStorageData("hotkey");
    //Далі виконуємо скрипт який додасть наші хоткеї до сторінки
    chrome.scripting.executeScript({
      target: {
        tabId: sender.tab.id,
      },
      func: handleKeys,
      args: [hotletter, hotkey],
    });
  }
  if (response.type == "GET_TAB_ID") {
    console.log(`tab id sended: ${sender.tab.id}`);
    sendResponse(sender.tab.id);
  }
});

//Це сам скрипт який ми додаємо на сторінку
function handleKeys(hotletter, hotkey) {
  document.addEventListener(
    "keydown",
    async function (e) {
      let button;
      switch (hotkey) {
        case "Control":
          button = e.ctrlKey;
          break;
        case "Alt":
          button = e.altKey;
          break;
        default:
          button = e.ctrlKey;
          break;
      }
      if (e.key === hotletter && button) {
        e.preventDefault();
        let idNote = prompt("Задайте idNote: ");
        if (!idNote) {
          return;
        }
        window.postMessage(
          {
            type: "SAVE",
            idNote: idNote,
          },
          "*"
        );
      }
    },
    false
  );
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command == "scrape-data") {
    console.log(`start scrape: ${tab.id}`);
    chrome.tabs.sendMessage(tab.id, { type: "START_SCRAPE", tabId: tab.id });
  }
});

//Функція для того щоб продати дані з chrome.storage
function getStorageData(sKey) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(sKey, function (items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}
