import type { show } from "@ark/util";

type Router = {
  routes: {};
};

function addRoute<router extends Router, name extends string>(
  router: router,
  name: name
): asserts router is router & { routes: { [k in name]: name } } {
  (router.routes as Record<string, string>)[name] = name;
}
type addRoute = typeof addRoute;

function getRoutes<router extends Router>(
  router: router
): show<router["routes"]> {
  return router.routes as never;
}

// Usage

const router: Router = { routes: {} };

addRoute(router, "one");
addRoute(router, "two");

export const routes = getRoutes(router);
//              ^? { one: "one"; two: "two"; }

/*

Is there a way to encapsulate the above like

const router = createRouter((route) => {
  route("one");
  route("two");
});

*/
