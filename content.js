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
      let json = [];

      data.forEach((item, i) => {
        let newJson = {};

        newJson.itemID = item.nid;
        newJson.shopID = item.user_id;
        newJson.longTitle = item.raw_title;
        newJson.shortTitle = item.raw_title.match(/\w+/g).join(" | ");
        newJson.volumeOfSales = item.view_sales;
        newJson.picUrl = item.pic_url;
        newJson.delivery = item.shopcard.delivery[0] || false;
        newJson.description = item.shopcard.description[0] || false;
        newJson.service = item.shopcard.service[0] || false;

        json.push(newJson);
      });

      console.log(json);
      // //--------------------------
      // const auctionsItem = document.querySelectorAll(
      //   '[data-category="auctions"]'
      // ); //шукаємо всі елементи auctions

      // auctionsItem.forEach((item) => {
      //   item.style.display = "none";
      // });

      // let filteredData;

      // filteredData = data.filter((item) => {
      //   if (
      //     item.shopcard["delivery"][0] >= mrg &&
      //     item.shopcard["description"][0] >= mrg &&
      //     item.shopcard["service"][0] >= mrg
      //   ) {
      //     return item;
      //   }
      // });

      // if (isChecked) {
      //   let wl = whitelist.split("\n"); //перетворюємо дані з whitelist у массив
      //   filteredData = filteredData.filter((item) => wl.includes(item.user_id));
      // }

      // filteredData.forEach((item) => {
      //   auctionsItem.forEach((auction) => {
      //     if (auction.querySelector(`a[trace-nid="${item.nid}"]`)) {
      //       auction.style.display = "block";
      //     }
      //   });
      // });
    }
    //--------------------------
  })();
};
