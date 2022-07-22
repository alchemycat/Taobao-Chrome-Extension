//Відкриваємо наступну сторінку
function nextPage() {
  return new Promise((resolve, reject) => {
    const nextButton = document.querySelector('a[trace="srp_bottom_pagedown"]');

    if (!nextButton) {
      reject(false);
    }

    nextButton.click();
    resolve(true);
  });
}
