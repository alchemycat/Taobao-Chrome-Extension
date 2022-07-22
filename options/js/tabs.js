function tabs() {
  //Таби, змінюють меню
  const navlinks = document.querySelectorAll(".nav-link");
  const tabs = document.querySelectorAll(".tab-pane");

  navlinks.forEach((link, i) => {
    link.addEventListener("click", () => {
      navlinks.forEach((item) => {
        item.classList.remove("active");
      });
      tabs.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("show");
      });
      link.classList.add("active");

      tabs[i].classList.add("show");
      tabs[i].classList.add("active");
    });
  });
}
