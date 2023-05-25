import { renderTemplate } from "../src/ui/index.js";
import { renderScripts } from "../src/ui/index.js";
import { tag, html } from "../src/ui/tags.js";

const Toggle = () => {
  const toggleButton = tag(
    "button",
    {
      scriptName: "toggle-button",
      script(el) {
        const contentElement = document.getElementById("toggle-content");
        el.addEventListener("click", () => {
          if (contentElement.style.display === "none") {
            contentElement.style.display = "block";
          } else {
            contentElement.style.display = "none";
          }
        });
      },
    },
    "Toggle"
  );

  const content = tag(
    "div",
    {
      id: "toggle-content",
      style: { display: "none" },
    },
    "Toggleable Content"
  );

  const scriptString = renderScripts(toggleButton);

  const script = tag("script", {}, scriptString);
  const page = html({ body: [toggleButton, content, script] });

  return renderTemplate(page); // returns html
};

console.log(Toggle());
