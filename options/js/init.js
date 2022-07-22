function init() {
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
}