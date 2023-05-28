export function renderScripts(object) {
  if (typeof object !== "object") return "";

  if(Array.isArray(object)) return object.map(item => renderScripts(item)).join('\n')
  const { slots = [], script, props = {} } = object;
  const { scriptName } = props;

  let scriptStr = "";
  if (scriptName && script) {
    const name = scriptName.replace(/\-/g, "_");

    scriptStr = "function " + script.toString().replace("script", name);
    scriptStr += `\ndocument.querySelectorAll('[${scriptName}]').forEach(el => {
      ${name}(el, JSON.parse(el.getAttribute("${scriptName}")))
  })`;
  }

  return [scriptStr, ...slots.map((slot) => renderScripts(slot))].join("\n");
}
