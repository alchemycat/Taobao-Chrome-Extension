window.onload = () => {
  (async () => {
    //Активуємо таби
    tabs(".nav-link", ".tab-pane");
    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є
    inputs("#mrg", "#whitelist", "#whitelistCheckbox");
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
