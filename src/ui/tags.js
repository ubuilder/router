import { renderHead, renderScripts, renderTemplate } from "./index.js";
export function tag(tag, props = {}, ...slots) {
  return {
    tag,
    props,
    slots,
    toString() {
      renderTemplate(this);
    },
    toHead() {
      renderHead(this);
    },
    toScript() {
      renderScripts(this);
    },
  };
}

export function html({ head, body } = {}) {
  return tag("html", {}, [
    head && tag("head", {}, head),
    tag("body", {}, body),
  ]);
}
