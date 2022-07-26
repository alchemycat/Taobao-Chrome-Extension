function showModal() {
  const body = document.querySelector("body");

  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modalContainer");

  const modal = document.createElement("div");
  modal.classList.add("sheetsContent");
  modal.id = "sheetsPopup";

  const close = document.createElement("button");
  close.classList.add("close");
  close.textContent = "✖";
  modal.append(close);

  const img = document.createElement("img");
  img.src = "https://cdn-icons-png.flaticon.com/512/281/281761.png";
  modal.append(img);

  const p = document.createElement("p");
  p.textContent = "Парсинг завершено, всі дані збережено до таблиці";
  modal.append(p);

  const button = document.createElement("button");
  button.classList.add("accept");
  button.textContent = "Продовжити";

  modalContainer.append(modal);
  modal.append(button);

  body.append(modalContainer);
  body.style.overflow = "hidden";

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    removeModal();
  });

  close.addEventListener("click", (e) => {
    e.stopPropagation();
    removeModal();
  });

  document.addEventListener("keydown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.key == "Enter" || e.key == "Escape") {
      removeModal();
    }
  });

  function removeModal() {
    modalContainer.remove();
    body.style.overflow = "inherit";
  }
}
