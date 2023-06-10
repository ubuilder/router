import { router } from "../../src/routing/index.js";

await router.registerFolder("./pages"); // second parameter is used for configurations...


router.serve({ port: 3002, dev: true }); // in dev mode enable nodemon and livereload...

/*

router.build({ out: "./docs" }); // build static files (all routes except [id] and [...rest] routes)

*/