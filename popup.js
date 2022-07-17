window.onload = () => {
  console.log("Popup loaded");

  (async () => {
    function getData(sKey) {
      return new Promise(function (resolve, reject) {
        chrome.storage.local.get(sKey, function (items) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(items[sKey]);
          }
        });
      });
    }

    const inputRating = document.getElementById("mrg"),
      whitelist = document.getElementById("whitelist"),
      whitelistCheckbox = document.getElementById("whitelist_checkbox");

    let minimalRating = await getData("minimalRating");
    if (minimalRating) {
      inputRating.value = minimalRating;
    }

    let isChecked = await getData("whitelistChecked");

    if (isChecked) {
      whitelistCheckbox.checked = isChecked;
    } else {
      whitelist.setAttribute("disabled", true);
    }

    let whitelistValue = await getData("whitelist");
    if (whitelistValue) {
      whitelist.value = whitelistValue;
    }

    inputRating.addEventListener("input", () => {
      if (/\D/.test(inputRating.value)) {
        inputRating.value = inputRating.value.replace(/\D/, "");
      }

      chrome.storage.local.set({ minimalRating: inputRating.value });
    });

    whitelistCheckbox.addEventListener("change", () => {
      if (!whitelistCheckbox.checked) {
        whitelist.setAttribute("disabled", true);
      } else {
        whitelist.removeAttribute("disabled");
      }
      chrome.storage.local.set({ whitelistChecked: whitelistCheckbox.checked });
    });

    whitelist.addEventListener("input", () => {
      if (/\ /.test(whitelist.value)) {
        whitelist.value = whitelist.value.replace(/\ /, "\n");
      }
      console.log(whitelist.value.split("\n"));
      chrome.storage.local.set({ whitelist: whitelist.value });
    });
  })();
};
