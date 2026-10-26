const languageButtons = document.querySelectorAll("[data-language]");
const languagePanels = document.querySelectorAll("[data-language-panel]");

function setLanguage(language) {
  document.documentElement.lang = language === "en" ? "en" : "tr";
  languageButtons.forEach((button) => {
    const active = button.dataset.language === language;
    button.setAttribute("aria-pressed", String(active));
  });
  languagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.languagePanel !== language;
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});
