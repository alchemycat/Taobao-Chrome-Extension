window.onload = () => {
  (async () => {
    //Таби, змінюють меню
    const navlinks = document.querySelectorAll(".nav-link");
    const tabs = document.querySelectorAll(".tab-pane");

    navlinks.forEach((link, i) => {
      link.addEventListener("click", () => {
        navlinks.forEach((item) => {
          item.classList.remove("active");
        });
        tabs.forEach((item) => {
          item.classList.remove("active");
          item.classList.remove("show");
        });
        link.classList.add("active");

        tabs[i].classList.add("show");
        tabs[i].classList.add("active");
      });
    });

    //Пошук елементів в popup
    const inputRating = document.getElementById("mrg"),
      whitelist = document.getElementById("whitelist"),
      whitelistCheckbox = document.getElementById("whitelist_checkbox");
    let isChecked = await getStorageData("whitelistChecked");

    //забираємо дані зі storage про мінімальний рейтинг якщо вони там вже є
    let minimalRating = await getStorageData("minimalRating");
    if (minimalRating) {
      inputRating.value = minimalRating;
    }

    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є

    //якщо потрібно то активуємо textarea або додаємо disabled
    if (isChecked) {
      whitelistCheckbox.checked = isChecked;
    } else {
      whitelist.setAttribute("disabled", true);
    }

    //забираємо дані зі storage про те чи додані в whitelist вже якісь id
    let whitelistValue = await getStorageData("whitelist");
    if (whitelistValue) {
      whitelist.value = whitelistValue;
    }

    //слідкуємо за подією input для поля мінімального рейтингу
    inputRating.addEventListener("input", () => {
      if (/\D/.test(inputRating.value)) {
        inputRating.value = inputRating.value.replace(/\D/, "");
      }
      //додаємо отримані дані у storage
      chrome.storage.local.set({ minimalRating: inputRating.value });
    });

    //слідкуємо за активністю checkbox
    whitelistCheckbox.addEventListener("change", () => {
      //додаємо або видаляємо атрибут disabled для textarea
      if (!whitelistCheckbox.checked) {
        whitelist.setAttribute("disabled", true);
      } else {
        whitelist.removeAttribute("disabled");
      }
      //додаємо отримані дані у storage
      chrome.storage.local.set({ whitelistChecked: whitelistCheckbox.checked });
    });

    whitelist.addEventListener("input", () => {
      if (/\ /.test(whitelist.value)) {
        //додаємо \n для нового значення
        whitelist.value = whitelist.value.replace(/\ /, "\n");
      }
      //додаємо отримані дані у storage
      chrome.storage.local.set({ whitelist: whitelist.value });
    });

    //Встановлюємо хоткеї
    const hotkey = document.getElementById("hotkey");
    const hotletter = document.getElementById("hotletter");

    //отримуємо актуальні хоткеї
    let key = await getStorageData("hotkey");
    let letter = await getStorageData("hotletter");

    if (key) {
      //якщо раніше вже були встановлено хоткей то показуємо значення
      hotkey.value = key;
    } else {
      //якщо не було встановлено хоткей показуємо значення за замовченням
      hotkey.value = "Control";
    }

    if (letter) {
      //якщо раніше вже були встановлено літеру то показуємо значення
      hotletter.value = letter;
    } else {
      //якщо не було встановлено літеру показуємо значення за замовченням
      hotletter.value = "s";
    }

    //Якщо користувач вводить значення для хоткею то обробляємо його
    hotkey.addEventListener("keydown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      //приймаємо тільки ctrl та alt
      if (e.key == "Control" || e.key == "Alt") {
        e.target.value = e.key;
        //зберігаємо нове значення в chrome.storage
        chrome.storage.local.set({ hotkey: hotkey.value });
      }
    });

    //Якщо користувач вводить значення для літери то обробляємо його
    hotletter.addEventListener("keydown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.target.value = e.key;
      //зберігаємо нове значення в chrome.storage
      chrome.storage.local.set({ hotletter: hotletter.value });
    });

    //Показуємо які таблиці доступні для користування
    async function showOptions() {
      const select = document.getElementById("select");
      const deleteButton = document.getElementById("delete");
      const options = document.querySelectorAll("option[value]");
      let list = await getStorageData("list");

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
    //викликаємо функцію показати таблиці
    showOptions();

    //Якщо користувач змінює таблицю за замовченням тоді потрібно встановити нове значення для таблиці в chrome.storage

    select.addEventListener("change", async (e) => {
      //беремо назву таблиці яку вибрав користувач
      const name = e.target.value;
      //Достаємо таблиці з chrome.storage
      let list = await getStorageData("list");
      try {
        //видаляємо атрибут selected з таблиці яка була обрана до цього
        document.querySelector(`option[selected]`).removeAttribute("selected");

        //встановлюємо атрибут selected для нової обраної таблиці
        document
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

    //Додати нову таблицю

    const buttonSpreadsheet = document.querySelector("#add_spreadsheet");

    buttonSpreadsheet.addEventListener("click", addSpreadsheet);

    async function addSpreadsheet() {
      const form = document.getElementById("create_spreadsheet");
      const name = document.getElementById("name");
      const postLink = document.getElementById("post_link");
      const spreadsheetLink = document.getElementById("spreadsheet_link");
      const select = document.getElementById("select");
      const deleteButton = document.getElementById("delete");

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
    }

    //Видалення таблиць

    const deleteButton = document.getElementById("delete");

    deleteButton.addEventListener("click", deleteSpreadsheet);

    async function deleteSpreadsheet() {
      //Отримуємо список таблиці з chrome.storage
      let list = await getStorageData("list");
      let name = document.querySelector("option[selected=true]").value;
      const itemIndex = list.findIndex((elem) => elem.name == name);

      //Видаляємо елемент з списку
      list.splice(itemIndex, 1);
      //зберігаємо дані в chrome.storage
      chrome.storage.local.set({ list });
      //показуємо опції вже з новою таблицею
      showOptions();
    }

    //Це функція для створення сповіщень про дії користувача
    function addNotification(target, text, type) {
      let errors = document.querySelectorAll(".error");
      let success = document.querySelectorAll(".success");

      errors.forEach((item) => {
        item.remove();
      });
      success.forEach((item) => {
        item.remove();
      });

      let notificaiton = document.createElement("div");
      notificaiton.setAttribute("class", `${type} mt-1`);
      let color;

      if (type == "error") {
        color = "red";
      } else {
        color = "green";
      }

      notificaiton.style.cssText = `color: ${color}; font-size: 15px;`;

      notificaiton.textContent = text;

      target.parentElement.parentElement.append(notificaiton);

      setTimeout(() => {
        try {
          notificaiton.remove();
        } catch {}
      }, 4000);
    }
  })();
};
