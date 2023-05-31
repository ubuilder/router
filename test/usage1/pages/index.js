export default function ({ url, pathname, params }) {
  return View({}, [
    View({ tag: "h1" }, "Hello World!"),
    View({ tag: "h2" }, "This is Index Page"),
    View({}, "full Url of this page is: " + url),
    View({}, "pathname of this page is: " + pathname),
    View(
      {},
      "params of this page should be empty object: " + JSON.stringify(params)
    ),
  ]);
}
