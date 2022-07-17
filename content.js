window.onload = () => {
  (async () => {
    //Отримуємо дані які зараз в storage
    let mrg = await getData("minimalRating");
    let isChecked = await getData("whitelistCheckbox");
    let whitelist = await getData("whitelist");
    let data;

    //чекаємо оновлення данних які знаходяться в storage
    chrome.storage.onChanged.addListener(async function (changes, namespace) {
      if (changes) {
        if (changes.minimalRating.newValue) {
          mrg = parseInt(changes.minimalRating.newValue);
        }
        if (changes.whitelist.newValue) {
          whitelist = changes.whitelist.newValue;
        }
        if (changes.whitelistCheckbox.newValue) {
          isChecked = changes.whitelistCheckbox.newValue;
        }
        if (isNaN(mrg)) {
          mrg = 0;
        }
        changeVisibility(data, whitelist);
      }
    });
    //--------------------------

    //слухаємо дані які повинні дійти зі сторінки
    window.addEventListener("message", async (event) => {
      if (event.data.type == "FROM_PAGE") {
        data = event.data.formatted;
        console.log(data);
        chrome.storage.local.set({ data });
        const wl = await getData("whitelist");
        changeVisibility(data, wl);
      }
    });
    //--------------------------

    //знаходимо об'єкт g_page_config у скриптах на сторінці, парсимо його в об'єкт та передаємо в іншу функцію
    const scripts = document.querySelectorAll("script");

    scripts.forEach((item) => {
      if (/g_page_config/.test(item.textContent)) {
        const g_page_config = item.textContent
          .replace("g_page_config = ", "")
          .trim()
          .split("}};");

        const f = JSON.parse(g_page_config[0] + "}}");

        var data = {
          type: "FROM_PAGE",
          formatted: f.mods.itemlist.data.auctions,
        };
        window.postMessage(data, "*");
      }
    });
    //--------------------------

    function changeVisibility(data, whitelist) {
      const auctionsItem = document.querySelectorAll(
        '[data-category="auctions"]'
      );

      const wl = whitelist.split("\n");

      auctionsItem.forEach((auction) => {
        auction.style.display = "block";
      });

      auctionsItem.forEach((auction) => {
        const nid = auction
          .querySelector("a[trace-nid]")
          .getAttribute("trace-nid");

        const auctionIndex = data.findIndex((obj) => obj.nid == nid);
        if (auctionIndex == -1) {
          console.log(`Такого елементу немає у массиві`);
        }

        const target = data[auctionIndex];

        const result = filter(
          target,
          mrg,
          ["delivery", "description", "service"],
          wl
        );

        if (!result) {
          console.log("Додав display: none для елемента");
          auction.style.display = "none";
        }
      });
    }
  })();

  function getData(sKey) {
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

  async function filter(target, mrg, keys, list) {
    const isChecked = await getData("whitelistCheckbox");
    let success = 0;
    let isExist = false;

    if (isChecked) {
      list.forEach((item) => {
        if (target["user_id"] == item) {
          isExist = true;
        }
      });
      if (isExist) {
        return true;
      }
    }

    // if (!isExist) {
    //   keys.forEach((item) => {
    //     if (target.shopcard[item] && target.shopcard[item][0] > mrg) {
    //       success += 1;
    //     }
    //   });
    // }

    // if (success === 3) {
    //   return true;
    // }
    return false;
  }
};
