const { encode } = require("querystring");
const isInertiaRequest = require("./is-inertia-request");

const {
  INERTIA,
  PARTIAL_DATA,
  PARTIAL_COMPONENT,
} = require("./inertia-headers");

const getPartialData = require("./get-partial-data");

function inertia(sails, { hook, sharedProps, sharedViewData, rootView }) {
  return function inertiaMiddleware(req, res, next) {
    hook.render = function (component, props = {}, viewData = {}) {
      const allProps = {
        ...sharedProps,
        ...props,
      };

      const allViewData = {
        ...sharedViewData,
        ...viewData,
      };

      let url = req.url || req.originalUrl;
      const assetVersion = sails.config.inertia.version;
      const currentVersion =
        typeof assetVersion == "function" ? assetVersion() : assetVersion;

      const page = {
        component,
        version: currentVersion,
        props: allProps,
        url,
      };

      // Implements inertia partial reload. See https://inertiajs.com/partial-reload
      if (req.get(PARTIAL_DATA) && req.get(PARTIAL_COMPONENT) === component) {
        const only = req.get(PARTIAL_DATA).split(",");
        page.props = only.length ? getPartialData(props, only) : page.props;
      }

      const queryParams = req.query;
      if (req.method == "GET" && Object.keys(queryParams).length) {
        // Keep original request query params
        url += `?${encode(queryParams)}`;
      }

      // Implements inertia requests
      if (isInertiaRequest(req)) {
        return res.status(200).json(page);
      }

      // Implements full page reload
      return sails.hooks.views.render(rootView, {
        page,
        viewData: allViewData,
      });
    };
    hook.location = function (url = req.headers["referer"]) {
      const statusCode = ["PUT", "PATCH", "DELETE"].includes(req.method)
        ? 303
        : 409;
      res.set("X-Inertia-Location", url);
      return res.redirect(statusCode, url);
    };

    // Set Inertia headers
    if (isInertiaRequest(req)) {
      res.set(INERTIA, true);
      res.set("Vary", "Accept");
    }
    return next();
  };
}

module.exports = inertia;
