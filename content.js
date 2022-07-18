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
      } else {
        console.log(event);
      }
    });
    //--------------------------

    //Функція яка ховає та показує елементи
    function changeVisibility(data, whitelist) {
      const auctionsItem = document.querySelectorAll(
        '[data-category="auctions"]'
      ); //шукаємо всі елементи auctions

      auctionsItem.forEach((item) => {
        item.style.display = "none";
      });

      let filteredData;

      filteredData = data.filter(
        (item) =>
          item.shopcard["delivery"][0] >= mrg &&
          item.shopcard["description"][0] >= mrg &&
          item.shopcard["service"][0] >= mrg
      );

      if (isChecked) {
        let wl = whitelist.split("\n"); //перетворюємо дані з whitelist у массив
        filteredData = filteredData.filter((item) => !wl.includes(item.nid));
      }

      filteredData.forEach((item) => {
        let elem = document.querySelector(`a[trace-nid="${item.nid}"]`);
        if (elem) {
          elem.parentElement.parentElement.parentElement.parentElement.style.display =
            "block";
        }
      });
    }
    //--------------------------
  })();
};
