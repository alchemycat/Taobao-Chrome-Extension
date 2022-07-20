document.addEventListener(
  "keydown",
  async function (e) {
    if (
      e.key === "s" &&
      (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
    ) {
      e.preventDefault();
      let idNote = await prompt("Задайте idNote: ");
      window.postMessage(
        {
          type: "SAVE",
          idNote: idNote,
        },
        "*"
      );
    }
  },
  false
);
