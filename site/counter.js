import { tag, renderScripts, renderTemplate, html } from "../src/ui/index.js";

function Counter({ count = 0 }) {
  return tag(
    "div",
    {
      scriptName: "u-counter",
      scriptProps: { count },
      script(el, { count }) {
        function $(selector, callback) {
            el.querySelectorAll(selector).forEach(el => callback(el))
        }
        function on(element, event, callback) {
            element.addEventListener(event, callback)
        }
        function attr(element, attribute) {
            return element.getAttribute(attribute)
        }

        setCount(count);
        function setCount(newValue) {
          count = newValue;
          $("[u-count]", el => el.textContent = count);
        }

        $("[u-action]", (button) => {
          on(button, "click", (event) => {
            const action = attr(button, "u-action");

            if (action === "decrement") {
              setCount(count - 1);
            } else if (action === "increment") {
              setCount(count + 1);
            } else {
              setCount(0);
            }
          });
        });
      },
    },
    [
      tag("h1", {}, ["Value: ", tag("span", { "u-count": true })]),
      tag("button", { "u-action": "decrement" }, "Decrement"),
      tag("button", { "u-action": "reset" }, "Reset"),
      tag("button", { "u-action": "increment" }, "Increment"),
    ]
  );
}

const counter = Counter({ count: 6 });
const counterScript = tag("script", {}, renderScripts(counter));
const counterTemplate = renderTemplate(counter);
const counterHTML = html({
  body: [counterTemplate, counterScript],
});

console.log(renderTemplate(counterHTML));
