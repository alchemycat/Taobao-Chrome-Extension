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

    const inputRating = document.getElementById("mrg");

    let minimalRating = await getData("minimalRating");
    if (minimalRating) {
      inputRating.value = minimalRating;
    }
    inputRating.addEventListener("input", () => {
      if (/\D/.test(inputRating.value)) {
        inputRating.value = inputRating.value.replace(/\D/, "");
      }

      chrome.storage.local.set({ minimalRating: inputRating.value });
    });
  })();
};
