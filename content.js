window.onload = () => {
  (async () => {
    //
    let css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = chrome.runtime.getURL("assets/sprite/sprite.css");
    document.querySelector("head").append(css);
    //--------------------------

    //Отримуємо дані які зараз в storage
    let mrg = parseInt(await getStorageData("minimalRating"));
    let isChecked = await getStorageData("whitelistChecked");
    let whitelist = await getStorageData("whitelist");
    let data;
    //--------------------------
    chrome.storage.local.set({ json: [] });

    fetchData(location.href);

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
        // chrome.storage.local.set({ data });
        changeVisibility(data, whitelist);
      }
    });
    //--------------------------

    chrome.runtime.onMessage.addListener(async (response, sendResponse) => {
      if (response.type == "URL_CHANGED") {
        chrome.storage.local.set({ json: [] });
        fetchData(location.href);
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

          let formattedTitle = item.raw_title.match(/\w+/g);

          if (Array.isArray(formattedTitle)) {
            if (formattedTitle.length > 1) {
              formattedTitle = formattedTitle.join(" | ");
            } else if (formattedTitle.length == 1) {
              formattedTitle = formattedTitle[0];
            }
          } else {
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

      let jsonLength = await getStorageData("json");
      console.log(jsonLength);

      if (!jsonLength.length) {
        chrome.storage.local.set({ json });
      }

      json = json.map((item, i) => {
        if (
          item.delivery < mrg ||
          item.description < mrg ||
          item.service < mrg
        ) {
          item.filter = false;
          return item;
        } else {
          return item;
        }
      });

      if (isChecked) {
        let wl = whitelist.split("\n");

        json = json.map((item) => {
          if (item.filter) {
            if (!wl.includes(item.shopID)) {
              item.filter = false;
            }
          }
          return item;
        });
      }

      // console.log(JSON.stringify(json));
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

            if (!isExist) {
              let sprite = document.createElement("div");
              sprite.classList.add("sprite");
              sprite.classList.add("icon-plus");
              sprite.style.backgroundImage = `url(${chrome.runtime.getURL(
                "assets/sprite/sprite.png"
              )})`;
              sprite.style.position = "absolute";
              sprite.style.bottom = "10px";
              sprite.style.right = "35px";

              elem.style.position = "relative";
              elem.append(sprite);

              sprite.addEventListener("click", (e) => {
                e.stopPropagation();
                if (sprite.classList.contains("icon-plus")) {
                  sprite.classList.remove("icon-plus");
                  sprite.classList.add("icon-minus");
                  elem.style.border = "1px solid green";
                  item.toSave = true;
                  console.log("saved");
                  chrome.storage.local.set({ json });
                } else {
                  sprite.classList.remove("icon-minus");
                  sprite.classList.add("icon-plus");
                  elem.style.border = "1px solid red";
                  item.toSave = false;
                  chrome.storage.local.set({ json });
                }
              });
            }
          }
        }
      });
    }
    //--------------------------
  })();
};
