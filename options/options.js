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

    //Пошук елементів в popup
    const inputRating = document.getElementById("mrg"),
      whitelist = document.getElementById("whitelist"),
      whitelistCheckbox = document.getElementById("whitelist_checkbox");

    //забираємо дані зі storage про мінімальний рейтинг якщо вони там вже є
    let minimalRating = await getStorageData("minimalRating");
    console.log(minimalRating);
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
    // chrome.storage.local.set({ list: [] });
    async function showOptions() {
      const select = document.getElementById("select");
      const options = document.querySelectorAll("option[value]");
      let list = await getStorageData("list");

      try {
        // console.log(`show list: ${JSON.stringify(list)}`);

        if (!list.length) {
          chrome.storage.local.set({ list: [] });
          select.setAttribute("disabled", true);
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
      } catch (err) {
        console.log(err);
      }
    }

    showOptions();
    //Змінити опцію
    select.addEventListener("change", async (e) => {
      const name = e.target.value;
      let list = await getStorageData("list");
      try {
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
      } catch (err) {
        console.log(err);
      }
    });

    //Додати таблицю

    const buttonSpreadsheet = document.querySelector("#add_spreadsheet");

    buttonSpreadsheet.addEventListener("click", async () => {
      const form = document.getElementById("create_spreadsheet");
      const name = document.getElementById("name");
      const postLink = document.getElementById("post_link");
      const spreadsheetLink = document.getElementById("spreadsheet_link");
      const select = document.getElementById("select");

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
        list.forEach((item) => {
          item.selected = false;
        });

        list.push({
          name: name.value,
          postLink: postLink.value,
          spreadsheetLink: spreadsheetLink.value,
          selected: true,
        });

        form.reset();

        select.removeAttribute("disabled");

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
