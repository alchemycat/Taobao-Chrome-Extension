//Додати нову таблицю
async function addSpreadsheet(
  buttonSelector,
  formSelector,
  nameSelector,
  postLinkSelector,
  spreadsheetLinkSelector,
  selectSelector,
  deleteSelector
) {
  const button = document.querySelector(buttonSelector);

  button.addEventListener("click", async () => {
    const form = document.querySelector(formSelector);
    const name = document.querySelector(nameSelector);
    const postLink = document.querySelector(postLinkSelector);
    const spreadsheetLink = document.querySelector(spreadsheetLinkSelector);
    const select = document.querySelector(selectSelector);
    const deleteButton = document.querySelector(deleteSelector);

    //Отримуємо список таблиці з chrome.storage
    let list = await getStorageData("list");

    //Перевіряємо чи користувач ввів нову назву для таблиці
    if (!name.value) {
      name.focus();
      //Якщо ні то нагадуємо що потрібно ввести назву
      addNotification(buttonSpreadsheet, "Додайте назву", "error");
      return;
    }
    //Перевіряємо чи користувач ввів нове посилання для вебхука
    if (!postLink.value) {
      postLink.focus();
      //Якщо ні то нагадуємо що потрібно ввести посилання для вебхука
      addNotification(
        buttonSpreadsheet,
        "Додайте посилання для відправки POST запиту",
        "error"
      );
      return;
    }
    //Перевіряємо чи користувач ввів нове посилання для таблиці
    if (!spreadsheetLink.value) {
      spreadsheetLink.focus();
      //Якщо ні то нагадуємо що потрібно ввести посилання для таблиці
      addNotification(
        buttonSpreadsheet,
        "Додайте посилання на таблицю",
        "error"
      );
      return;
    }

    //Шукаємо в списку чи є таблиця з такою назвою
    let resultIndex = list.findIndex((elem) => elem.name === name.value);

    //Якщо таблиця вже є нагадуємо користувачу що потрібно ввести унікальну назву
    if (!resultIndex) {
      name.focus();
      addNotification(
        buttonSpreadsheet,
        "Вкажіть іншу назву, вже є таблиця з такою назвою",
        "error"
      );
      return;
    } else {
      //у випадку якщо таблиці немає тоді додаємо її в список

      //спочатку змінюємо для всіх таблиць у списку параметр selected = false
      list.forEach((item) => {
        item.selected = false;
      });

      //додаємо нову таблицю і ставимо їй параметр selected = true означає що вона буде обрана за замовченням
      list.push({
        name: name.value,
        postLink: postLink.value,
        spreadsheetLink: spreadsheetLink.value,
        selected: true,
      });

      //після того як додали дані очищаємо інпути
      form.reset();

      //якщо селект був деактивований тоді активуємо його
      select.removeAttribute("disabled");
      deleteButton.removeAttribute("disabled");

      //зберігаємо дані в chrome.storage
      chrome.storage.local.set({ list });
      //сповіщуємо користувача що успішно додали таблицю
      addNotification(buttonSpreadsheet, "Таблиця успішно додана", "success");
      //показуємо опції вже з новою таблицею
      showOptions();
    }
  });
}
