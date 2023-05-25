export function tag(tag, { script, style, ...props }, ...slots) {
  return {
    tag,
    props,
    slots,
    script,
    style,
  };
}

export function html({ head, body }) {
  return tag("html", {}, [
    head && tag("head", {}, head),
    tag("body", {}, body),
  ]);
}
