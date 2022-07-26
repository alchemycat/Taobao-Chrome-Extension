window.onload = () => {
  (async () => {
    //Активуємо таби
    tabs(".nav-link", ".tab-pane");
    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є
    inputs(
      "#mrg",
      "#timeout",
      "#whitelist",
      "#whitelistCheckbox",
      "#popularCheckbox"
    );
    //Встановлюємо хоткеї
    hotkeys("#hotkey", "#hotletter");
    //Таблиці
    spreadsheet(
      ".spreadsheetForm",
      "#addSpreadsheet",
      "#name",
      "#webhookLink",
      "#spreadsheetLink",
      ["filterList", "scrapeList"]
    );
  })();
};
