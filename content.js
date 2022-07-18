window.onload = () => {
  (async () => {
    //Отримуємо дані які зараз в storage
    let mrg = parseInt(await getStorageData("minimalRating"));
    let isChecked = await getStorageData("whitelistChecked");
    let whitelist = await getStorageData("whitelist");
    let data;
    //--------------------------

    //Обсервер який слідкує за змінами на сторінці
    var previousUrl = "";

    var observer = new MutationObserver(async function (mutations) {
      if (location.href !== previousUrl) {
        previousUrl = location.href;

        //Робимо запит для оновлення даних
        fetchData(location.href);
      }
    });

    const config = { subtree: true, childList: true };
    observer.observe(document, config);
    //--------------------------

    //чекаємо оновлення данних які знаходяться в storage
    chrome.storage.onChanged.addListener(async function (changes, namespace) {
      if (changes) {
        if (changes.minimalRating) {
          mrg = parseInt(changes.minimalRating.newValue);
        }
        if (changes.whitelist) {
          whitelist = changes.whitelist.newValue;
        }
        if (changes.whitelistChecked) {
          isChecked = changes.whitelistChecked.newValue;
        }
        if (isNaN(mrg)) {
          mrg = 0;
        }
        //викликаємо функцію яка змінить відображення елементів на основі нових даних
        changeVisibility(data, whitelist);
      }
    });
    //--------------------------

    //слухаємо дані які повинні дійти зі сторінки
    window.addEventListener("message", async (event) => {
      if (event.data.type == "FROM_PAGE") {
        data = event.data.formatted;
        chrome.storage.local.set({ data });
        changeVisibility(data, whitelist);
      }
    });
    //--------------------------

    //Функція яка ховає та показує елементи
    function changeVisibility(data, whitelist) {
      const auctionsItem = document.querySelectorAll(
        '[data-category="auctions"]'
      ); //шукаємо всі елементи auctions

      let wl;

      if (whitelist) {
        wl = whitelist.split("\n"); //перетворюємо дані з whitelist у массив
      }

      //Додаємо кожному елементу display: block;
      auctionsItem.forEach((auction) => {
        auction.style.display = "block";
      });

      //Тут вже працюємо з кожним елементом окремо
      auctionsItem.forEach((auction) => {
        const nid = auction
          .querySelector("a[trace-nid]")
          .getAttribute("trace-nid"); //отримуємо nid елемента

        const auctionIndex = data.findIndex((obj) => obj.nid == nid); //перевіряємо чи є в масиві з отриманими даними такий елемент

        if (auctionIndex == -1) {
          console.log(
            `Nid: ${nid} немає у массиві з даними: ${JSON.stringify(data)}`
          );
          return; //якщо елементу немає тоді йдемо далі
        }

        const target = data[auctionIndex]; //якщо елемент є тоді достаємо всі дані з массиву data по його індексу

        const result = filter(
          target,
          mrg,
          ["delivery", "description", "service"],
          wl
        ); //Виконуємо функцію filter на основі якої і будем ховати або показувати елемент

        if (!result) {
          auction.style.display = "none"; //додаємо display: none; якщо елемент не підходить
          console.log(`NID: ${target.nid} Ховаю елемент`);
        }
      });
    }
    //--------------------------

    //Функція на основі якої приймається рішення чи ховати елемент
    function filter(target, mrg, keys, list) {
      let success = 0;
      let isExist = false;

      //Перевіряємо чи whitelist використовується, а також чи є в ньому дані
      if (isChecked && list) {
        //проходимо по кожному елементу з whitelist та зрівнюємо з user_id нашого елементу
        list.forEach((item) => {
          if (target["user_id"] == item) {
            isExist = true; //додаємо значення яке говорить про те що такий елемент знайшовся і потрібно його показувати на сторінці
          }
        });

        if (!isExist) {
          return false; //якщо потрібних елементів не знайдено тоді просто повертаємо false і ховаємо елемент
        }
      }

      //keys = ["delivery", "description", "service"]
      keys.forEach((item) => {
        //Перевіряємо чи наш елемент має в собі delivery,description,service а також одразу і перевіряємо рейтинг
        if (
          target.shopcard &&
          target.shopcard[item] &&
          Array.isArray(target.shopcard[item]) &&
          target.shopcard[item][0] >= mrg
        ) {
          success += 1; //якщо правило проходить тоді дописуємов +1 до успішних ітерацій
        }
      });

      if (success === 3) {
        //якщо було 3 успішні ітерації це значить що елемент пройшов тест і його потрібно показати тому повертаємо true
        return true;
      } else {
        //повертаємо false елемент не пройшов тест
        return false;
      }
    }
    //--------------------------
  })();
};
