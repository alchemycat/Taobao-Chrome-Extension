window.onload = () => {
  (async () => {
    //Додаємо на сторінку спрайти
    addCSS("assets/sprite/sprite.css");

    //Додаємо на сторінку повідомлення про стан збереження в таблицю
    addCSS("assets/alert/alert.css");
    //--------------------------

    //Отримуємо дані які зараз в storage
    let minRating = parseInt(await getStorageData("minimalRating")); //Рейтинг
    let isChecked = await getStorageData("whitelistChecked"); //Чекбокс вайтліст
    let whitelist = await getStorageData("whitelist"); //Вайтліст

    //Додаємо глобальні зміні для збереження результату сторінки
    let initialData = []; //глобальна зміна яка зберігає g_page_config до фільтрації
    let toSaveData = []; //глобальна зміна яка зберігає дані які пройшли фільтрацію (потрібна для збереження даних)

    //Робимо запит на taobao щоб отримати дані для цієї сторінки
    fetchData(location.href);

    //Відправляємо повідомлення у background, яке ініціює додавання хоткеїв для збереження даних в таблицю на сторінку
    chrome.runtime.sendMessage({ type: "INJECT" });

    //чекаємо оновлення данних які знаходяться в storage
    chrome.storage.onChanged.addListener(async function (changes) {
      if (changes) {
        console.log("changes");
        //Якщо змінився рейтинг
        if (changes.minimalRating) {
          minRating = parseInt(changes.minimalRating.newValue); //Встановлюємо новий рейтинг

          if (isNaN(minRating)) {
            //Якщо в рейтинг додано некорректне значення встановлюємо 0
            minRating = 0;
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
        filterData(initialData, whitelist);
      }
    });
    //--------------------------

    //Тут ми чекаємо дані які приходять з скриптів які ми додали в контекст сторінки
    window.addEventListener("message", async (event) => {
      //Якщо type == DATA тоді нам прийшов новий g_page_config зі сторінки
      if (event.data.type == "DATA") {
        console.log("data message");
        initialData = event.data.formatted; // встановлюємо актуальні дані для глобальної зміної
        filterData(initialData, whitelist);
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
        // toSaveData = [];
        // initialData = [];

        //Запит нових даних для нової сторінки
        fetchData(location.href);
      }

      //Тут нам приходить сповіщення про статус збереження даних в таблицю
      if (response.type == "DELIVERY") {
        createAlert(response.message, response.status); //Додаємо на сторінку повідомлення про статус збереження даних
      }
    });

    //Функція яка фільтрує дані
    async function filterData(data, whitelist) {
      //Спочатку достаємо тільки потрібні дані в наш новий об'єкт
      console.log(`Income data length ${JSON.stringify(data)}`);
      let correctData = data.map((item, i) => {
        try {
          let filteredData = {};

          //Регулярка яка фільтрує тайтл
          let formattedTitle = item.raw_title
            .replace(/(\s|)(\p{Script=Han}+(\s|))\p{Script=Han}+(\s|)/gu, " | ")
            .replace(/(?<=(\w|\W))\p{Script=Han}+(?=(\w|\W))/gu, " | ")
            .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

          //Якщо тайтл не підлягає фільтрації просто записуємо стандартний Keyword + стандартний тайтл
          if (!formattedTitle) {
            formattedTitle = `Keyword ${item.raw_title}`;
          }

          //Збираємо дані які там потрібні з g_page_config
          console.log(`Index: ${i}`);
          filteredData.index = i;
          filteredData.itemID = item.nid;
          filteredData.shopID = item.user_id;
          filteredData.longTitle = item.raw_title;
          filteredData.shortTitle = formattedTitle;
          filteredData.volumeOfSales = item.view_sales;
          filteredData.picUrl = item.pic_url;
          filteredData.delivery = item.shopcard.delivery[0] || 0;
          filteredData.description = item.shopcard.description[0] || 0;
          filteredData.service = item.shopcard.service[0] || 0;
          filteredData.filter = true;
          filteredData.toSave = false;
          filteredData.idNote = "";
          filteredData.url = `https://item.taobao.com/item.htm?id=${item.nid}`;

          return filteredData; //Повертаємо в новий массив зібрані дані
        } catch (err) {
          console.log(err);
        }
      });

      //Фільтр по рейтингу
      correctData = correctData.map((item, i) => {
        if (
          item.delivery < minRating ||
          item.description < minRating ||
          item.service < minRating
        ) {
          item.filter = false;
          item.toSave = false;
          return item;
        } else {
          item.filter = true;
          item.toSave = true;
          return item;
        }
      });

      //Фільтр по вайтлісту
      if (isChecked) {
        let wl = whitelist.split("\n");

        correctData = correctData.map((item) => {
          if (item.filter) {
            if (!wl.includes(item.shopID)) {
              item.filter = false;
              item.toSave = false;
            }
          }
          return item;
        });
      }

      toSaveData = correctData; //Записуємо відфільтровані дані в глобальну зміну (зміна потрібна для збереження даних)

      showElements(correctData); //Викликаємо функцію для відображення елементів на сторінці відносно налаштувань фільтра
    }

    function showElements(data) {
      //Тут починається логіка відображення елементів на сторінці
      // спочатку надаємо всім елементам display: block;
      let allElems = document.querySelectorAll('[data-category="auctions"]');
      allElems.forEach((item) => {
        item.style.display = "block";
      });
      //-------------------------

      data.forEach((item) => {
        //Перевіряємо чи елемент пройшов фільтрацію, якщо ні то ховаємо його

        if (!item.filter) {
          const elem = document.querySelector(
            `div[data-index="${item.index}"]`
          );
          console.log(`Ховаю елемент ${item.index}`);
          if (elem) {
            elem.style.display = "none"; //ховаємо елемент
          }
        } else {
          const elem = document.querySelector(
            `div[data-index="${item.index}"]`
          );

          console.log(
            `Показую елемент: ${elem.getAttribute(
              "data-index"
            )}\nItem:${JSON.stringify(item)}`
          );

          //Елемент пройшов фільтрацію, залишаємо елемент на сторінці та додаємо спрайт
          if (elem) {
            elem.style.position = "relative"; //Задаємо стилі для нашого елемента

            //Приводимо елемент до початкового стану (сторінка могла не оновлюватись а налаштування фільтра змінитись)
            const isExist = elem.querySelector(".sprite");
            if (isExist) {
              isExist.remove();
              elem.classList.remove("red-border");
              elem.classList.add("green-border");
            }
            //-------------------------

            let sprite = document.createElement("div");
            sprite.classList.add("sprite");
            sprite.classList.add("icon-minus");
            sprite.style.backgroundImage = `url(${chrome.runtime.getURL(
              "assets/sprite/sprite.png"
            )})`;

            elem.classList.add("green-border");

            elem.append(sprite);

            sprite.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (sprite.classList.contains("icon-plus")) {
                //Переключаємо стилі
                sprite.classList.remove("icon-plus");
                sprite.classList.add("icon-minus");

                elem.classList.add("green-border");
                elem.classList.remove("red-border");

                //Змінюємо параметр для фільтра
                item.toSave = true;
              } else {
                //Переключаємо стилі
                sprite.classList.remove("icon-minus");
                sprite.classList.add("icon-plus");

                elem.classList.add("red-border");
                elem.classList.remove("green-border");

                //Змінюємо параметр для фільтра
                item.toSave = false;
              }
              //Змінюємо глобальну зміну
              toSaveData = data;
            });
          }
        }
      });
    }
  })();
};
