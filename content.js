window.onload = () => {
  (async () => {
    //Отримуємо дані які зараз в storage
    let mrg = parseInt(await getStorageData("minimalRating")); //Рейтинг
    let isChecked = await getStorageData("whitelistChecked"); //Чекбокс вайтліст
    let whitelist = await getStorageData("whitelist"); //Вайтліст

    //Додаємо глобальні зміні для збереження результату сторінки
    let initialData = []; //глобальна зміна яка зберігає g_page_config до фільтрації
    let toSaveData = []; //глобальна зміна яка зберігає дані які пройшли фільтрацію (потрібна для збереження даних)

    //Додаємо на сторінку спрайти
    let spriteLink = document.createElement("link");
    spriteLink.rel = "stylesheet";
    spriteLink.href = chrome.runtime.getURL("assets/sprite/sprite.css");
    document.querySelector("head").append(spriteLink);

    //Додаємо на сторінку повідомлення про стан збереження в таблицю
    let alertLink = document.createElement("link");
    alertLink.rel = "stylesheet";
    alertLink.href = chrome.runtime.getURL("assets/alert/alert.css");
    document.querySelector("head").append(alertLink);
    //--------------------------

    //Робимо запит на taobao щоб отримати дані для цієї сторінки
    fetchData(location.href);

    //Відправляємо повідомлення у background, яке ініціює додавання хоткеїв для збереження даних в таблицю на сторінку
    chrome.runtime.sendMessage({ type: "INJECT" });

    //чекаємо оновлення данних які знаходяться в storage
    chrome.storage.onChanged.addListener(async function (changes, namespace) {
      if (changes) {
        //Якщо змінився рейтинг
        if (changes.minimalRating) {
          mrg = parseInt(changes.minimalRating.newValue); //Встановлюємо новий рейтинг

          if (isNaN(mrg)) {
            //Якщо в рейтинг додано некорректне значення встановлюємо 0
            mrg = 0;
          }
        }
        //Якщо є зміни у вайтлисті
        if (changes.whitelist) {
          whitelist = changes.whitelist.newValue; //Встановлюємо нові дані до вайтліста
        }
        //Якщо чекбокс використання вайтліста включився/виклювся
        if (changes.whitelistChecked) {
          isChecked = changes.whitelistChecked.newValue; //Встановлюємо нове значення
        }

        //Якщо дані в storage змінилися ми використовуємо глобальну змінну з (початковими даними) для повторної фільтрації, щоб уникнути повторго запроса для отримання одних і тих самих даних
        changeVisibility(initialData, whitelist);
      }
    });
    //--------------------------

    //Тут ми чекаємо дані які приходять з скриптів які ми додали в контекст сторінки
    window.addEventListener("message", async (event) => {
      //Якщо type == DATA тоді нам прийшов новий g_page_config зі сторінки
      if (event.data.type == "DATA") {
        initialData = event.data.formatted;
        changeVisibility(initialData, whitelist);
      }
      //Якщо type == "SAVE" це значить що хоткеї для збереження даних були нажаті і в нас є idNote, далі потрібно відправляти дані в таблицю
      if (event.data.type == "SAVE") {
        if (!toSaveData.length) {
          createAlert("Ви ще не зібрали дані які можна зберігати", "failure");
          return;
        }

        //Фільтруємо масив перед збереженням в таблицю і встановлюємо idNote для елементів
        let preparedData = toSaveData.filter((item) => {
          if (item.toSave) {
            item.idNote = event.data.idNote;
            return item;
          }
        });

        //Проста валідація чи є в массиві потрібні дані
        if (!preparedData.length) {
          createAlert("Ви ще не зібрали дані які можна зберігати", "failure");
          return;
        }
        //Відправляємо дані до background
        chrome.runtime.sendMessage({ type: "SAVE_DATA", json: preparedData });
      }
    });
    //--------------------------

    chrome.runtime.onMessage.addListener(async (response) => {
      //Тут чекаємо на повідомлення чи змінилась сторінка
      if (response.type == "URL_CHANGED") {
        //Це потрібно тому що сторінка на оновлюється і нам потрібно додаткове сповіщення яке перевіряє чи location.href змінився
        //Якщо нова сторінка то задаємо нове значення для глобальних змінних
        toSaveData = [];
        initialData = [];

        //Запит нових даних для нової сторінки
        fetchData(location.href);
      }

      //Тут нам приходить сповіщення про статус збереження даних в таблицю
      if (response.type == "DELIVERY") {
        createAlert(response.message, response.status); //Додаємо на сторінку повідомлення про статус збереження даних
      }
    });

    //Функція яка ховає та показує елементи
    async function changeVisibility(data, whitelist) {
      let json = [];
      document
        .querySelectorAll('[data-category="auctions"]')
        .forEach((item) => {
          item.style.display = "block";
        }); // спочатку надаємо всім елементам display: block;
      data.forEach((item, i) => {
        try {
          let newJson = {};

          let formattedTitle = item.raw_title
            .replace(/(\s|)(\p{Script=Han}+(\s|))\p{Script=Han}+(\s|)/gu, " | ")
            .replace(/(?<=(\w|\W))\p{Script=Han}+(?=(\w|\W))/gu, " | ")
            .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

          if (!formattedTitle) {
            formattedTitle = `Keyword ${item.raw_title}`;
          }

          newJson.index = i + 1;
          newJson.itemID = item.nid;
          newJson.shopID = item.user_id;
          newJson.longTitle = item.raw_title;
          newJson.shortTitle = formattedTitle;
          newJson.volumeOfSales = item.view_sales;
          newJson.picUrl = item.pic_url;
          newJson.delivery = item.shopcard.delivery[0] || 0;
          newJson.description = item.shopcard.description[0] || 0;
          newJson.service = item.shopcard.service[0] || 0;
          newJson.filter = true;
          newJson.toSave = false;
          newJson.idNote = "";
          newJson.url = `https://item.taobao.com/item.htm?id=${item.nid}`;

          json.push(newJson);
        } catch (err) {
          console.log(err);
        }
      });

      json = json.map((item, i) => {
        if (
          item.delivery < mrg ||
          item.description < mrg ||
          item.service < mrg
        ) {
          item.filter = false;
          return item;
        } else {
          item.toSave = true;
          return item;
        }
      });

      if (isChecked) {
        let wl = whitelist.split("\n");

        json = json.map((item) => {
          if (item.filter) {
            if (!wl.includes(item.shopID)) {
              item.filter = false;
              item.toSave = false;
            }
          }
          return item;
        });
      }

      toSaveData = json;

      json.forEach((item) => {
        if (!item.filter) {
          const elem = document.querySelector(
            `div[data-index="${item.index - 1}"]`
          );
          if (elem) {
            elem.style.display = "none"; //ховаємо елемент
          }
        } else {
          const elem = document.querySelector(
            `div[data-index="${item.index - 1}"]`
          );
          if (elem) {
            const isExist = elem.querySelector(".sprite");

            if (isExist) {
              isExist.remove();
              elem.classList.remove("red-border");
              elem.classList.add("green-border");
            }
            let sprite = document.createElement("div");
            sprite.classList.add("sprite");
            sprite.classList.add("icon-minus");
            sprite.style.backgroundImage = `url(${chrome.runtime.getURL(
              "assets/sprite/sprite.png"
            )})`;
            sprite.style.position = "absolute";
            sprite.style.bottom = "10px";
            sprite.style.right = "35px";

            elem.style.position = "relative";

            elem.classList.add("green-border");

            elem.append(sprite);

            sprite.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (sprite.classList.contains("icon-plus")) {
                sprite.classList.remove("icon-plus");
                sprite.classList.add("icon-minus");
                elem.classList.add("green-border");
                elem.classList.remove("red-border");
                item.toSave = true;
                toSaveData = json;
              } else {
                sprite.classList.remove("icon-minus");
                sprite.classList.add("icon-plus");
                elem.classList.add("red-border");
                elem.classList.remove("green-border");
                item.toSave = false;
                toSaveData = json;
              }
            });
          }
        }
      });
    }
    //--------------------------
  })();
};
