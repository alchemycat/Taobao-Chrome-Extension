//Відкриваємо наступну сторінку
function nextPage() {
  return new Promise((resolve, reject) => {
    const nextButton = document.querySelector(".next");

    if (!nextButton) {
      reject(false);
    }

    nextButton.click();
    resolve(true);
  });
}
