export function tag(tag, props = {}, ...slots) {
  return {
    tag,
    props,
    slots,
  };
}

export function html({ head, body } = {}) {
  return tag("html", {}, [
    head && tag("head", {}, head),
    tag("body", {}, body),
  ]);
}
