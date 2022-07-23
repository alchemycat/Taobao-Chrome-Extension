//Функція хелпер для того щоб додавати свій css на сторінку
function addCSS(href) {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL(href);
  document.querySelector("head").append(link);
}
