export default function ({ params }) {
  return View({}, [View({}, "This is /:id page and page id is: ", params.id)]);
}
