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
    const json = await getStorageData("json");

    if (json) {
      addToTable(json);
    }

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

    send.addEventListener("click", (e) => {
      e.preventDefault();
      note = document.querySelector("#note");
      error = document.querySelector(".error");

      if (!note.value.length) {
        error.textContent = "Спочатку заповніть idNote";
        error.classList.remove("hide");
        note.focus();
        if (!send.getAttribute("disabled")) {
          send.setAttribute("disabled", true);
        }
      }
    });

    //Додавання даних до таблиці
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.json.newValue) {
        const json = changes.json.newValue;
        addToTable(json);
      }
    });

    function addToTable(data) {
      const tableBody = document.querySelector(".table-body");
      data.forEach((item, i) => {
        let row = `<tr>
        <th scope="row">${item.itemID}</th>
        <td>${item.shopID}</td>
        <td>${item.volumeOfSales}</td>
        <td>${item.shortTitle}</td>
        <td>${item.picUrl}</td>
      </tr>`;
        tableBody.insertAdjacentHTML("afterbegin", row);
      });
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
  })();
};
