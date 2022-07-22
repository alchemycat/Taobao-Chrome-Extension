async function setHotkeys() {
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
}
