window.onload = () => {
  const mrg = 480;

  window.addEventListener("message", (event) => {
    if (event.data.type == "FROM_PAGE") {
      let data = event.data.formatted;
      const auctionsItem = document.querySelectorAll(
        '[data-category="auctions"]'
      );

      auctionsItem.forEach((auction) => {
        const nid = auction
          .querySelector("a[trace-nid]")
          .getAttribute("trace-nid");

        const auctionIndex = data.findIndex((obj) => obj.nid == nid);
        if (auctionIndex == -1) {
          console.log(`Такого элемента нету в массиве с данными`);
        }
        const shopcard = data[auctionIndex].shopcard;

        const result = filter(shopcard, mrg, [
          "delivery",
          "description",
          "service",
        ]);

        if (!result) {
          console.log("Скрываю элемент");
          auction.style.display = "none";
          console.log(auction);
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

  // console.log(formatted);

  // const target = formatted.filter((item) => {
  //   if (item.nid == itemId) {
  //     return item;
  //   }
  // });
  // console.log(target);
};
