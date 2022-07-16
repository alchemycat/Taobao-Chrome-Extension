window.onload = () => {
  (async () => {
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

    let mrg = await getData("minimalRating");
    let data;
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      if (changes.minimalRating) {
        mrg = parseInt(changes.minimalRating.newValue); //установка актуального значения для количества собранных постов

        if (isNaN(mrg)) {
          mrg = 0;
        }

        changeVisibility(data, mrg);
      }
    });

    window.addEventListener("message", (event) => {
      if (event.data.type == "FROM_PAGE") {
        data = event.data.formatted;

        chrome.storage.local.set({ data });

        changeVisibility(data, mrg);
      }
    });

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

    function changeVisibility(data) {
      const auctionsItem = document.querySelectorAll(
        '[data-category="auctions"]'
      );

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
        const shopcard = data[auctionIndex].shopcard;

        const result = filter(shopcard, mrg, [
          "delivery",
          "description",
          "service",
        ]);

        if (!result) {
          console.log("Додав display: none для елемента");
          auction.style.display = "none";
        }
      });

      function filter(target, mrg, keys) {
        let success = 0;

        keys.forEach((item) => {
          if (target[item] && target[item][0] > mrg) {
            success += 1;
          }
        });

        if (success === 3) {
          return true;
        }
        return false;
      }
    }
  })();
};
