//Функція для створення сповіщень про дії користувача на сторінці
function createAlert(text, status) {
  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((item) => {
    item.remove();
  });

  let alert = document.createElement("div");
  alert.setAttribute("class", "alert");
  alert.textContent = text;
  document.body.append(alert);
  alert.classList.add(status);
  setTimeout(() => {
    alert.classList.remove(status);
  }, 4000);
}
