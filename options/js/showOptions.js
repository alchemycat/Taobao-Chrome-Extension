async function showOptions(selectSelector, deleteSelector, storageKey) {
  const select = document.querySelector(selectSelector);
  const deleteButton = document.querySelector(deleteSelector);
  const options = select.querySelectorAll("option[value]");
  let list = await getStorageData(storageKey);

  try {
    //якщо таблиць ще немає ставимо для селекту значення disabled
    if (!list || !list.length) {
      chrome.storage.local.set({ list: [] });
      select.setAttribute("disabled", true);
      deleteButton.setAttribute("disabled", true);
    }

    if (options) {
      //видаляємо всі опції
      options.forEach((item) => {
        item.remove();
      });
    }

    //Якщо в списку немає атрибута селектед тоді встановлюємо його для останнього елемента
    if (list.length) {
      const itemIndex = list.findIndex((elem) => elem.selected);
      if (itemIndex === -1) {
        list[list.length - 1].selected = true;
        chrome.storage.local.set({ list });
      }
    }

    list.forEach((item) => {
      //створюємо опції на основі актуальних даних
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item.name;
      if (item.selected) {
        option.setAttribute("selected", true);
      }
      select.append(option);
    });
  } catch (err) {
    console.log(err);
  }
}
