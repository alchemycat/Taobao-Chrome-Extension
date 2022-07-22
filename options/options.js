window.onload = () => {
  (async () => {
    //Активуємо таби
    tabs();
    //забираємо дані зі storage про те чи потрібно використовувати whitelist якщо вони там вже є
    init();
    //Встановлюємо хоткеї
    setHotkeys();
    //Показуємо які таблиці доступні для користування
    showOptions(".select__filter", ".filter__delete", "list");

    //Зміна таблиці

    changeSpreadsheet(".select__filter", "list");

    //Додати новую таблицю
    addSpreadsheet(
      "#add_spreadsheet",
      "#create_spreadsheet",
      "#name",
      "#post_link",
      "#spreadsheet_link",
      ".select__filter",
      ".filter__delete"
    );

    //Видалення таблиць

    deleteSpreadsheet(".filter__delete", ".select__filter", "list");

    //Вибір типу таблиці
    const radios = document.querySelector('[name="spreadsheet_type"]');

    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        console.log(`Checked: ${e.target.id}`);
      });
    });
  })();
};
