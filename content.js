window.onload = () => {
  (async () => {
    //
    let css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = chrome.runtime.getURL("assets/sprite/sprite.css");
    document.querySelector("head").append(css);
    //--------------------------

    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("js/inject.js");
    document.querySelector("head").append(script);

    //Отримуємо дані які зараз в storage
    let mrg = parseInt(await getStorageData("minimalRating"));
    let isChecked = await getStorageData("whitelistChecked");
    let whitelist = await getStorageData("whitelist");
    // let hotkey = await getStorageData("hotkey");
    let id;
    let save = [];
    //--------------------------

    chrome.runtime.sendMessage({ type: "PAGE_LOAD" });

    //чекаємо оновлення данних які знаходяться в storage
    chrome.storage.onChanged.addListener(async function (changes, namespace) {
      if (changes) {
        // console.log(changes);
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
        let data = await getStorageData(id);
        save = data;
        changeVisibility(data, whitelist);
      }
    });
    //--------------------------

    //слухаємо дані які повинні дійти зі сторінки
    window.addEventListener("message", async (event) => {
      if (event.data.type == "FROM_PAGE") {
        chrome.storage.local.set({ [id]: event.data.formatted });
      }

      if (event.data.type == "SAVE") {
        console.log(event.data.idNote);
        let prepared = save.filter((item) => {
          if (item.toSave) {
            item.idNote = event.data.idNote;
            return item;
          }
        });
        chrome.runtime.sendMessage({ type: "SAVE_DATA", json: prepared });
      }
    });
    //--------------------------

    chrome.runtime.onMessage.addListener(async (response, sendResponse) => {
      if (response.type == "ID") {
        id = response.id;
        fetchData(location.href);
      }
      if (response.type == "URL_CHANGED") {
        save = [];
        fetchData(location.href);
      }
    });

    //Функція яка ховає та показує елементи
    async function changeVisibility(data, whitelist) {
      let json = [];
      // console.log(`Функция запущена: ${JSON.stringify(data)}`);
      document
        .querySelectorAll('[data-category="auctions"]')
        .forEach((item) => {
          item.style.display = "block";
        }); // спочатку надаємо всім елементам display: block;
      data.forEach((item, i) => {
        try {
          let newJson = {};

          let formattedTitle = item.raw_title
            .replace(/(\s|)(\p{Script=Han}(\s|))+\p{Script=Han}+(\s|)/gu, " | ")
            .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

          if (!formattedTitle) {
            formattedTitle = `Keyword ${target}`;
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

      save = json;

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
                console.log("saved");
                save = json;
                // console.log(JSON.stringify(item));
              } else {
                sprite.classList.remove("icon-minus");
                sprite.classList.add("icon-plus");
                elem.classList.add("red-border");
                elem.classList.remove("green-border");
                item.toSave = false;
                save = json;
                console.log("deleted");
                // console.log(JSON.stringify(item));
              }
            });
          }
        }
      });
    }
    //--------------------------
  })();
};
