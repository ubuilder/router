function renderAttributes({ scriptName, scriptProps, ...object }) {
  let result = "";
  if (scriptName) {
    result += " " + scriptName + "='" + JSON.stringify(scriptProps ?? {}) + "'";
  }

  for (let [key, value] of Object.entries(object)) {
    if (typeof value === "object") {
      result += " " + key + "='" + JSON.stringify(value) + "'";
    } else {
      result += " " + key + "=" + JSON.stringify(value);
    }
  }
  return result;
}

function renderSlots(slots) {
  return slots.map((slot) => renderTemplate(slot)).join('');
}

export function renderTemplate(object) {
  if (typeof object === "undefined") return;
  if (Array.isArray(object))
    return object.map((item) => renderTemplate(item)).join("\n");
  if (typeof object === "object") {
    const { tag, slots, props } = object;

    if (!tag) return "";

    return (
      `<${tag}${renderAttributes(props)}>` + renderSlots(slots) + `</${tag}>`
    );
  }
  return object;
}
