//Збираємо дані зі сторінки в массив
function collectData() {
  return new Promise((resolve, reject) => {
    try {
      const items = document.querySelectorAll(".item");
      const collectedData = [];

      items.forEach((item) => {
        const id = item.getAttribute("data-id");
        const title = item.querySelector(".item-name").textContent;
        const photo = item.querySelector(".photo img").src;
        const price = item.querySelector(".c-price").textContent;
        const sales = item.querySelector(".sale-num").textContent;
        let keys = title
          .replace(
            /(\s|)((\p{Script=Han}+|)(\s|))\p{Script=Han}+(\s|)/gu,
            " | "
          )
          .replace(/(?<=(\w|\W))\p{Script=Han}+(?=(\w|\W))/gu, " | ")
          .replace(/(^(\s\|\s)|(\s\|\s)$)/g, "");

        collectedData.push({
          url: `https://item.taobao.com/item.htm?id=${id}`,
          shop: shopId,
          title: title,
          sales: sales,
          keys: keys,
          photo: photo,
          category: href,
          price: price,
        });
      });

      resolve(collectedData);
    } catch (err) {
      reject(err);
    }
  });
}
