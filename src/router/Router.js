import findMyWay from "find-my-way";
import http from "http";
import * as qs from "qs";

import { renderHead, renderTemplate, renderScripts } from "@ulibs/router";

export function Router() {
  const app = findMyWay();

  const layouts = [];

  function startServer(port = 3000) {
    console.log("server started at http://localhost:" + port);
    return http
      .createServer((req, res) => {
        // normailze
        if (req.url.endsWith("/") && req.url !== "/")
          req.url = req.url.substring(0, req.url.length - 1);

        app.lookup(req, res);
      })
      .listen(port);
  }

  function handleRequest(req, res) {
    if (req.url.endsWith("/") && req.url !== "/")
      req.url = req.url.substring(0, req.url.length - 1);

    return app.lookup(req, res);
  }

  function parseBody(req) {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => resolve(body));
    });
  }

  function addPage(
    route,
    { load = undefined, page = undefined, actions = {}, layout }
  ) {
    app.get(route, async (req, res, params) => {
      function getRequest() {
        const queryString = req.url.split("?")[1];
        return {
          get url() {
            return req.url;
          },
          get headers() {
            return req.headers;
          },
          get params() {
            return params;
          },
          get query() {
            return qs.parse(queryString);
          },
          locals: {},
        };
      }

      function getLoads() {
        return [
          ...layouts
            .filter((layout) => req.url.startsWith(layout.route))
            .map((layout) => layout.load),
          load,
        ].filter(Boolean);
      }

      async function runLoad() {
        let result = {};
        let loads = getLoads();

        const request = getRequest();

        for (let index = 0; index < loads.length; index++) {
          result = { ...result, ...(await loads[index](request)) };
        }
        return result;
      }

      function getComponents() {
        return [
          ...layouts
            .filter((layout) => req.url.startsWith(layout.route))
            .map((layout) => layout.component),
          page,
        ];
      }

      function renderPage(props) {
        let result;
        const components = getComponents();

        // let pageComponent = page(props);
        for (let i = components.length - 1; i >= 0; i--) {
          result = components[i](props, result);
        }

        const head = renderHead(result);
        const template = renderTemplate(result);
        const script = renderScripts(result);

        return `<html>
<head>
    ${head}
</head>
<body>
    ${template}
    <script>
        ${script}
    </script>
</body>
</html>`;
      }

      let props = {};
      let result;

      if (load) {
        props = await runLoad();
      }

      if (page) {
        result = renderPage(props);
      } else {
        result = JSON.stringify(props);
      }
      return res.end(result);
    });

    app.post(route, async (req, res, params, store, query) => {
      function getActionName() {
        for (let key in query) {
          if (query[key] === "") {
            return key;
          }
        }

        return null;
      }

      function getActions() {
        return [
          ...layouts
            .filter((layout) => req.url.startsWith(layout.route))
            .map((layout) => layout.actions),
          actions,
        ].filter(Boolean);
      }

      function getCurrentAction() {
        const actionName = getActionName();

        if (!actionName) return () => ({});

        for (let actionObject of getActions()) {
          if (actionObject[actionName]) {
            return actionObject[actionName];
          }
        }
        return () => ({});
      }

      async function getRequest() {
        const body = await parseBody(req);

        let request = {
          get body() {
            if (body.startsWith("{")) {
              // check from header
              return JSON.parse(body);
            } else {
              return qs.parse(body);
            }
          },
          get query() {
            return query;
          },
          get params() {
            return params;
          },
          locals: {},
        };

        return request;
      }

      const request = await getRequest();

      const result = await getCurrentAction()(request);

      res
        .writeHead(result?.status ?? 200, result?.headers ?? {})
        .end(result?.body ? JSON.stringify(result.body) : "");
    });
  }

  function addLayout(route, { component, load, actions } = {}) {
    layouts.push({ route, component, load, actions });
  }

  function removePage(route) {
    app.delete(route);
  }

  return {
    startServer,
    handleRequest,
    addPage,
    addLayout,
    removePage,
  };
}
