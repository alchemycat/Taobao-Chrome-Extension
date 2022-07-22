async function inputs(
  inputRatingSelector,
  timeoutSelector,
  whitelistSelector,
  whitelistCheckboxSelector
) {
  //Пошук елементів
  const inputRating = document.querySelector(inputRatingSelector),
    timeoutInput = document.querySelector(timeoutSelector),
    whitelist = document.querySelector(whitelistSelector),
    whitelistCheckbox = document.querySelector(whitelistCheckboxSelector);

  //забираємо дані зі storage
  let minimalRating = await getStorageData("minimalRating");
  let whitelistValue = await getStorageData("whitelist");
  let isChecked = await getStorageData("whitelistChecked");
  let timeout = await getStorageData("timeout");

  //Встановлюємо мінімальний рейтинг
  if (minimalRating) {
    inputRating.value = minimalRating;
  }

  //Встановлюємо таймаут
  if (timeout) {
    timeoutInput.value = timeout;
  }

  //активуємо textarea або додаємо disabled
  if (isChecked) {
    whitelistCheckbox.checked = isChecked;
  } else {
    whitelist.setAttribute("disabled", true);
  }

  //додаємо значення для вайтліста
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

  //слідкуємо за подією input для таймауту
  timeoutInput.addEventListener("input", () => {
    if (/\D/.text(timeoutInput.value)) {
      timeoutInput.value = timeoutInput.value.replace(/\D/, "");
    }

    chrome.storage.local.set({ timeout: timeoutInput.value });
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
}
