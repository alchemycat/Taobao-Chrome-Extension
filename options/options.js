window.onload = () => {
  (async () => {
    //Активуємо таби
    tabs(".nav-link", ".tab-pane");
    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є
    inputs("#mrg", "#whitelist", "#whitelistCheckbox");
    //Встановлюємо хоткеї
    setHotkeys();
    //Таблиці
    spreadsheet(
      ".spreadsheetForm",
      ".filter-select",
      "#addSpreadsheet",
      "#name",
      "#webhookLink",
      "#spreadsheetLink",
      ".filter-delete",
      "filterList"
    );
  })();
};
