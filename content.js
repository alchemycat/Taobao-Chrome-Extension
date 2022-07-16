window.onload = () => {
  const mrg = 480;

  const item = document.querySelector('[data-category="auctions"]');
  const itemNid = item.querySelector("a[trace-nid]").getAttribute("trace-nid");

  window.addEventListener("message", (event) => {
    if (event.data.type == "FROM_PAGE") {
      let data = event.data.formatted;
      const searchIndex = data.findIndex((object) => object.nid == itemNid);

      if (searchIndex == -1) {
        console.log(`Такого элемента нету в массиве с данными`);
      }

      const targetItem = data[searchIndex].shopcard;

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

      const result = filter(targetItem, mrg, [
        "delivery",
        "description",
        "service",
      ]);

      if (!result) {
        console.log("Скрываю элемент");
        item.style.display = "none";
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
