window.onload = () => {
  const url = location.href;

  //перевіряємо, якщо юрл підходить то запускаємо фільтер
  if (/taobao.com\/search\?/.test(url)) {
    filter();
  }

  //або запускаємо парсер
  if (/(taobao|tmall)\.com\/category/.test(url)) {
    scraper();
  }
};
