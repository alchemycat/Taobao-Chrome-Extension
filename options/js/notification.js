//Це функція для створення сповіщень про дії користувача
function addNotification(target, text, type) {
  let errors = document.querySelectorAll(".error");
  let success = document.querySelectorAll(".success");

  errors.forEach((item) => {
    item.remove();
  });
  success.forEach((item) => {
    item.remove();
  });

  let notificaiton = document.createElement("div");
  notificaiton.setAttribute("class", `${type} mt-1`);
  let color;

  if (type == "error") {
    color = "red";
  } else {
    color = "green";
  }

  notificaiton.style.cssText = `color: ${color}; font-size: 15px;`;

  notificaiton.textContent = text;

  target.parentElement.parentElement.append(notificaiton);

  setTimeout(() => {
    try {
      notificaiton.remove();
    } catch {}
  }, 4000);
}
