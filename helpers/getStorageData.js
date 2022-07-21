//Функція дістає дані з chrome.storage
function getStorageData(sKey) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(null, function (items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        }
      } else {
        resolve(items[sKey]);
      }
    });
  });
}
