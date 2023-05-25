import { renderScripts, renderTemplate } from "../src/ui/index.js";
import { html, tag } from "../src/ui/tags.js";

export default function Index(component) {
  const scripts = renderScripts(component);
  return html({
    head: tag("style", { rel: "stylesheet", href: "/styles.css" }),
    body: [component, scripts && tag("script", {}, scripts)],
  });
}

console.log(
  renderTemplate(
    Index(
      tag(
        "p",
        {
          scriptName: "Test",
          script() {
            console.log("hello");
          },
        },
        "Hello"
      )
    )
  )
);
