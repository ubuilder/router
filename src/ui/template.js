function stringify(object) {
  if (typeof object === "object") {
    return "'" + JSON.stringify(value) + "'";
  } else {
    return value;
  }
}

function renderAttributes({ scriptName, scriptProps, ...object }) {
  let result = "";
  if (scriptName) {
    result += " " + scriptName + "=" + stringify(scriptProps ?? {});
  }

  for (let [key, value] of Object.entries(object)) {
    result += " " + key + "=" + stringify(value);
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
