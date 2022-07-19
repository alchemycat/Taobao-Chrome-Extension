window.onload = () => {
  (async () => {
    //Таби
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

    //Додаємо дані в таблицю як тільки відкриваємо сторінку налаштувань
    let json = await getStorageData("json");

    if (json) {
      addToTable(json);
    }

    //Чекбокс ручна фільтрація

    const monkeyCheckbox = document.querySelector("#monkey_filter");

    let isMonkeyChecked = await getStorageData("monkeyChecked");

    if (isMonkeyChecked) {
      monkeyCheckbox.checked = isMonkeyChecked;
    } else {
      monkeyCheckbox.checked = false;
    }

    monkeyCheckbox.addEventListener("change", async () => {
      chrome.storage.local.set({ monkeyChecked: monkeyCheckbox.checked });
      // json = await getStorageData("json");
      addToTable(json);
    });

    //Заповнення idNote

    let note = document.querySelector("#note");
    const send = document.querySelector("#send");
    let error = document.querySelector(".error");

    note.addEventListener("input", () => {
      if (send.getAttribute("disabled")) {
        send.removeAttribute("disabled");
      }
      if (
        error.textContent == "Спочатку заповніть idNote" &&
        !error.classList.contains("hide")
      ) {
        error.classList.add("hide");
      }
    });

    //Відправка данних

    send.addEventListener("click", async (e) => {
      e.preventDefault();
      let checked = await getStorageData("monkeyChecked");
      note = document.querySelector("#note");
      error = document.querySelector(".error");
      json = await getStorageData("json");

      if (!note.value.length) {
        error.textContent = "Спочатку заповніть idNote";
        error.classList.remove("hide");
        note.focus();
        if (!send.getAttribute("disabled")) {
          send.setAttribute("disabled", true);
        }
        return;
      }

      if (!json.length) {
        error.textContent = "Не можна зберігати пустий результат";
        error.classList.remove("hide");
        if (!send.getAttribute("disabled")) {
          send.setAttribute("disabled", true);
        }
        return;
      }

      let data = [];
      if (checked) {
        data = json.filter((item) => {
          if (item.toSave) {
            item.idNote = note.value;
            return item;
          }
        });
      } else {
        data = json.map((item) => {
          item.idNote = note.value;
          return item;
        });
      }

      chrome.runtime.sendMessage({ json: data }, () => {});
    });

    //Додавання даних до таблиці
    chrome.storage.onChanged.addListener(async (changes) => {
      json = await getStorageData("json");
      console.log(json);
      addToTable(json);
    });

    async function addToTable(data) {
      const table = document.querySelector("table");
      let checked = await getStorageData("monkeyChecked");

      const tableBody = document.querySelector(".table-body");

      if (tableBody) {
        tableBody.remove();
      }

      const tbody = document.createElement("tbody");

      tbody.classList.add("table-body");

      data.forEach((item, i) => {
        if (checked) {
          if (item.toSave) {
            row = `<tr class="table-row">
            <th scope="row">${item.itemID}</th>
            <td>${item.shopID}</td>
            <td>${item.volumeOfSales}</td>
            <td>${item.shortTitle}</td>
            <td>${item.picUrl}</td>
            </tr>`;
            tbody.insertAdjacentHTML("afterbegin", row);
          }
        } else {
          row = `<tr class="table-row">
          <th scope="row">${item.itemID}</th>
          <td>${item.shopID}</td>
          <td>${item.volumeOfSales}</td>
          <td>${item.shortTitle}</td>
          <td>${item.picUrl}</td>
          </tr>`;
          tbody.insertAdjacentHTML("afterbegin", row);
        }
      });
      table.append(tbody);
    }

    //Пошук елементів в popup
    const inputRating = document.getElementById("mrg"),
      whitelist = document.getElementById("whitelist"),
      whitelistCheckbox = document.getElementById("whitelist_checkbox");

    //забираємо дані зі storage про мінімальний рейтинг якщо вони там вже є
    let minimalRating = await getStorageData("minimalRating");
    if (minimalRating) {
      inputRating.value = minimalRating;
    }

    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є
    let isChecked = await getStorageData("whitelistChecked");

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

    //Показати опції

    async function showOptions() {
      const select = document.getElementById("select");
      const options = document.querySelectorAll("option[value]");
      const list = await getStorageData("list");

      if (!list) {
        chrome.storage.local.set({ list: [] });
      }

      if (options) {
        options.forEach((item) => {
          item.remove();
        });
      }

      list.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        if (item.selected) {
          option.setAttribute("selected", true);
        }
        select.append(option);
      });
    }

    //Змінити опцію
    select.addEventListener("change", async (e) => {
      const name = e.target.value;
      const list = await getStorageData("list");

      document.querySelector(`option[selected]`).removeAttribute("selected");

      document
        .querySelector(`option[value="${e.target.value}"]`)
        .setAttribute("selected", true);

      let itemIndex = list.findIndex((elem) => elem.name == name);

      if (itemIndex) {
        list = list.map((item) => {
          item.selected = false;
          return item;
        });

        list[itemIndex].selected = true;

        chrome.storage.local.set({ list });
      }
    });

    //Додати таблицю

    const buttonSpreadsheet = document.querySelector("#add_spreadsheet");

    buttonSpreadsheet.addEventListener("click", async () => {
      const form = document.getElementById("create_spreadsheet");
      const name = document.getElementById("name");
      const postLink = document.getElementById("post_link");
      const spreadsheetLink = document.getElementById("spreadsheet_link");

      let list = await getStorageData("list");

      if (!name.value) {
        name.focus();
        addNotification(buttonSpreadsheet, "Додайте назву", "error");
        return;
      }
      if (!postLink.value) {
        postLink.focus();
        addNotification(
          buttonSpreadsheet,
          "Додайте посилання для відправки POST запиту",
          "error"
        );
        return;
      }
      if (!spreadsheetLink.value) {
        spreadsheetLink.focus();
        addNotification(
          buttonSpreadsheet,
          "Додайте посилання на таблицю",
          "error"
        );
        return;
      }

      let resultIndex = list.findIndex((elem) => elem.name === name.value);

      if (!resultIndex) {
        name.focus();
        addNotification(
          buttonSpreadsheet,
          "Вкажіть іншу назву, вже є таблиця з такою назвою",
          "error"
        );
        return;
      } else {
        list = list.map((item) => {
          item.selected = false;
          return list;
        });

        list.push({
          name: name.value,
          postLink: postLink.value,
          spreadsheetLink: spreadsheetLink.value,
          selected: true,
        });

        form.reset();

        chrome.storage.local.set({ list });
        addNotification(buttonSpreadsheet, "Таблиця успішно додана", "success");
        showOptions();
      }
    });

    //notifications
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
