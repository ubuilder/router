// should use cli

// 1:
// npx ulibs-serve ./pages --port=3002 --dev

// 2:
// npx ulibs-serve  # load default configuration file

// 3:
// npx ulibs-serve --config ./router2.config.js

// 4:
import { router } from "../../src/routing/index.js";
import routerConfig from "./router.config.js";

async function serve({ folder = "./pages", port = 4000, dev = false }) {
  await router.registerFolder(folder);
  router.serve({ port, dev });
}

serve(routerConfig);
