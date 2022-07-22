function spreadsheet(
  formSelector,
  addButtonSelector,
  nameInputSelector,
  webhookInputSelector,
  spreadsheetInputSelector,
  storageKeys
) {
  const form = document.querySelector(formSelector),
    addButton = document.querySelector(addButtonSelector);

  async function addSpreadsheet(
    form,
    addButton,
    nameInputSelector,
    webhookInputSelector,
    spreadsheetInputSelector
  ) {
    addButton.addEventListener("click", async () => {
      const name = document.querySelector(nameInputSelector),
        webhookLink = document.querySelector(webhookInputSelector),
        spreadsheetLink = document.querySelector(spreadsheetInputSelector),
        radios = document.querySelectorAll('[name="spreadsheet_type"]');

      let key;

      radios.forEach((radio) => {
        if (radio.checked) {
          key = radio.id;
        }
      });

      const deleteButton = document.querySelector(`[data-delete="${key}"]`);
      const select = document.querySelector(`[data-select="${key}"]`);

      //Отримуємо список таблиці з chrome.storage
      let list = await getStorageData([key]);

      //Перевіряємо чи користувач ввів нову назву для таблиці
      if (!name.value) {
        name.focus();
        //Якщо ні то нагадуємо що потрібно ввести назву
        addNotification(addButton, "Додайте назву", "error");
        return;
      }
      //Перевіряємо чи користувач ввів нове посилання для вебхука
      if (!webhookLink.value) {
        webhookLink.focus();
        //Якщо ні то нагадуємо що потрібно ввести посилання для вебхука
        addNotification(
          addButton,
          "Додайте посилання для відправки POST запиту",
          "error"
        );
        return;
      }
      //Перевіряємо чи користувач ввів нове посилання для таблиці
      if (!spreadsheetLink.value) {
        spreadsheetLink.focus();
        //Якщо ні то нагадуємо що потрібно ввести посилання для таблиці
        addNotification(addButton, "Додайте посилання на таблицю", "error");
        return;
      }

      //Шукаємо в списку чи є таблиця з такою назвою
      let resultIndex = list.findIndex((elem) => elem.name === name.value);

      //Якщо таблиця вже є нагадуємо користувачу що потрібно ввести унікальну назву
      if (!resultIndex) {
        name.focus();
        addNotification(
          addButton,
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
          webhookLink: webhookLink.value,
          spreadsheetLink: spreadsheetLink.value,
          selected: true,
        });

        //після того як додали дані очищаємо інпути
        form.reset();

        //якщо селект був деактивований тоді активуємо його
        select.removeAttribute("disabled");
        deleteButton.removeAttribute("disabled");

        //зберігаємо дані в chrome.storage
        chrome.storage.local.set({ [key]: list });
        //сповіщуємо користувача що успішно додали таблицю
        addNotification(addButton, "Таблиця успішно додана", "success");
        //показуємо опції вже з новою таблицею
        showSpreadsheet(storageKeys);
      }
    });
  }

  function changeSpreadsheet(keys) {
    keys.forEach((key) => {
      const select = document.querySelector(`[data-select="${key}"]`);

      select.addEventListener("change", async (e) => {
        //беремо назву таблиці яку вибрав користувач
        const name = e.target.value;
        //Достаємо таблиці з chrome.storage
        let list = await getStorageData(key);
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
            chrome.storage.local.set({ [key]: list });
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }

  async function deleteSpreadsheet(keys) {
    keys.forEach((key) => {
      const deleteButton = document.querySelector(`[data-delete="${key}"]`);
      const select = document.querySelector(`[data-select="${key}"]`);

      deleteButton.addEventListener("click", async () => {
        //Отримуємо список таблиці з chrome.storage
        let list = await getStorageData(key);
        let name = select.querySelector("option[selected=true]").value;
        const itemIndex = list.findIndex((elem) => elem.name == name);

        //Видаляємо елемент з списку
        list.splice(itemIndex, 1);
        //зберігаємо дані в chrome.storage
        chrome.storage.local.set({ [key]: list });
        //показуємо опції вже з новою таблицею
        showSpreadsheet(storageKeys);
      });
    });
  }

  function showSpreadsheet(keys) {
    keys.forEach(async (key) => {
      const select = document.querySelector(`[data-select="${key}"]`);
      const deleteButton = document.querySelector(`[data-delete="${key}"]`);
      const options = select.querySelectorAll("option[value]");
      let list = await getStorageData(key);

      try {
        //якщо таблиць ще немає ставимо для селекту значення disabled
        if (!list || !list.length) {
          chrome.storage.local.set({ [key]: [] });
          list = [];
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
            chrome.storage.local.set({ [key]: list });
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
    });
  }

  //Викликаємо функцію яка додає нову таблицю
  addSpreadsheet(
    form,
    addButton,
    nameInputSelector,
    webhookInputSelector,
    spreadsheetInputSelector
  );

  //Викликаємо функцію яка змінює таблицю
  changeSpreadsheet(storageKeys);
  //Викликаємо функцію яка видаляє таблицю
  deleteSpreadsheet(storageKeys);
  //Викликаємо функцію яка показую таблиці
  showSpreadsheet(storageKeys);
}
