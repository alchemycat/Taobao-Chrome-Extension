// Функція яка забирає json з потрібними даними
function fetchData(url) {
  fetch(url)
    .then((response) => response.body)
    .then((rb) => {
      const reader = rb.getReader();

      return new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(value);
              push();
            });
          }

          push();
        },
      });
    })
    .then((stream) => {
      // Відповідь з нашим стрімом
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      }).text();
    })
    .then((result) => {
      // Тут обробляємо result
      let json = result
        .match(/(?<=g_page_config\ =).*}};/)[0]
        .trim()
        .replace("}};", "}}");

      //Відправляємо json на сторінку
      window.postMessage(
        {
          type: "FROM_PAGE",
          formatted: JSON.parse(json).mods.itemlist.data.auctions,
        },
        "*"
      );
    });
}
