async function deleteSpreadsheet(deleteSelector, selectSelector, storageKey) {
  const deleteButton = document.querySelector(deleteSelector);

  deleteButton.addEventListener("click", async () => {
    //Отримуємо список таблиці з chrome.storage
    const select = document.querySelector(selectSelector);
    let list = await getStorageData(storageKey);
    let name = select.querySelector("option[selected=true]").value;
    const itemIndex = list.findIndex((elem) => elem.name == name);

    //Видаляємо елемент з списку
    list.splice(itemIndex, 1);
    //зберігаємо дані в chrome.storage
    chrome.storage.local.set({ list });
    //показуємо опції вже з новою таблицею
    showOptions();
  });
}
