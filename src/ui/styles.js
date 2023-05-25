export function renderStyle(object) {
  if (typeof object !== "object") return "";

  const { slots, style } = object;

  return [style, ...slots.map((slot) => renderStyle(slot))].join("");
}
