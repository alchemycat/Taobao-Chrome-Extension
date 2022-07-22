function changeSpreadsheet(selectSelector, storageKey) {
  const select = document.querySelector(selectSelector);

  select.addEventListener("change", async (e) => {
    //беремо назву таблиці яку вибрав користувач
    const name = e.target.value;
    //Достаємо таблиці з chrome.storage
    let list = await getStorageData(storageKey);
    try {
      //видаляємо атрибут selected з таблиці яка була обрана до цього
      select.querySelector(`option[selected]`).removeAttribute("selected");

      //встановлюємо атрибут selected для нової обраної таблиці
      select
        .querySelector(`option[value="${e.target.value}"]`)
        .setAttribute("selected", true);

      //в даних які отримали з chrome.storage шукаємо index таблиці по її назві
      let itemIndex = list.findIndex((elem) => elem.name == name);

      //змінюємо для всіх таблиці параметр selected = false;
      if (itemIndex) {
        list = list.map((item) => {
          item.selected = false;
          return item;
        });

        //знаходимо нову обрано таблицю і встановлюємо selected = true
        list[itemIndex].selected = true;

        //обновляємо дані в chrome.storage
        chrome.storage.local.set({ list });
      }
    } catch (err) {
      console.log(err);
    }
  });
}
