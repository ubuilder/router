export function renderScripts(object) {
  if (typeof object !== "object") return "";

  const { slots, script, props } = object;
  const { scriptName } = props;

  let scriptStr = "";
  if (scriptName) {
    const name = scriptName.replace(/\-/g, "_");

    scriptStr = "function " + script.toString().replace("script", name);
    scriptStr += `\ndocument.querySelectorAll('[${scriptName}]').forEach(el => {
      ${name}(el, el.getAttribute("${scriptName}"))
  })`;
  }

  return [scriptStr, ...slots.map((slot) => renderScripts(slot))].join("");
}
