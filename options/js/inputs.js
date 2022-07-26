async function inputs(
  inputRatingSelector,
  timeoutSelector,
  whitelistSelector,
  whitelistCheckboxSelector,
  popularCheckboxSelector
) {
  //Пошук елементів
  const inputRating = document.querySelector(inputRatingSelector),
    timeoutInput = document.querySelector(timeoutSelector),
    whitelist = document.querySelector(whitelistSelector),
    whitelistCheckbox = document.querySelector(whitelistCheckboxSelector),
    popularCheckbox = document.querySelector(popularCheckboxSelector);

  //забираємо дані зі storage
  let minimalRating = await getStorageData("minimalRating");
  let whitelistValue = await getStorageData("whitelist");
  let timeout = await getStorageData("timeout");
  let isWhitelistChecked = await getStorageData("whitelistChecked");
  let isPopularChecked = await getStorageData("popularChecked");

  //Встановлюємо мінімальний рейтинг
  if (minimalRating) {
    inputRating.value = minimalRating;
  }
  //Встановлюємо таймаут
  if (timeout) {
    timeoutInput.value = timeout / 1000;
  }

  //активуємо textarea або додаємо disabled
  if (isWhitelistChecked) {
    whitelistCheckbox.checked = isWhitelistChecked;
  } else {
    whitelist.setAttribute("disabled", true);
  }

  //стан для чекбокса зберігати популярні
  if (isPopularChecked) {
    popularCheckbox.checked = isPopularChecked;
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
    if (/\D/.test(timeoutInput.value)) {
      timeoutInput.value = timeoutInput.value.replace(/\D/, "");
    }
    let tm = parseInt(timeoutInput.value) * 1000;
    chrome.storage.local.set({ timeout: tm });
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

  popularCheckbox.addEventListener("change", () => {
    chrome.storage.local.set({ popularChecked: popularCheckbox.checked });
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
