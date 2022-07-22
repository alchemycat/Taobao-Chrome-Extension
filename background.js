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
chrome.runtime.onMessage.addListener(async (request, sender) => {
  //Якщо реквест == SAVE_DATA то потрібно зберегти дані в таблицю
  if (request.type == "SAVE_DATA") {
    //Достаємо всі таблиці які додані із chrome.storage
    const spreadsheetList = await getStorageData(request.list);

    //Далі шукаємо індекс таблиці яка має selected = true що означає вона зараз використовується за замовченням
    const itemIndex = spreadsheetList.findIndex((elem) => elem.selected);
    //Обираємо цю таблицю
    const item = spreadsheetList[itemIndex];
    //Достаємо з неї дані про webhook та посилання на саму таблицю
    const { spreadsheetLink, postLink } = item;

    //Робимо запит по даним які дістали
    fetch(postLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: spreadsheetLink, body: request.json }), //В реквесті передаємо лінк на таблицю та json
    }).then((response) => {
      if (response.status === 200) {
        //Якщо статус код запиту 200 то відправляємо меседж до content.js що все ок і дані збережені
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "DELIVERY",
          message: "Дані збережено успішно",
          status: "success",
        });
      } else {
        //Якщо статус код запиту не 200 то відправляємо меседж до content.js що дані не збережено
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "DELIVERY",
          message: "Дані не збережено. Перевірте таблицю та вебхук",
          status: "failure",
        });
      }
    });
  }
  //Якщо реквест == INJECT тоді нам потрібно додати хоткеї до сторінки
  if (request.type == "INJECT") {
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
        let idNote = await prompt("Задайте idNote: ");
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
    chrome.tabs.sendMessage(tab.tabId, "START_SCRAPE");
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
