# Inertia.js Sails Adapter

## Installation

## Backend

The quickest way to get setup an Inertia powered Sails app is to use the [create-sails](https://github.com/sailscastshq/create-sails) scaffolding tool. Just run

```sh
  npx create-sails <project-name>
```

> Do replace `<project-name>` with the name you want your project to be.

## Frontend

If you are using the [create-sails](https://github.com/sailscastshq/create-sails) scaffolding tool then the Frontend framework you choose from the CLI prompt should already be setup for you.

## Usage

### Responses

Sending back an Inertia responses is pretty simple, just use the `sails.inertia.render` method in your Sails actions(You can look at the example actions if you used create-sails). The `render` method accepts two arguments, the first is the name of the component you want to render from within your `pages` directory in `assets/js` (without the file extension).

The second argument is the props object where you can provide props to your components.

## Shared Data

If you have data that you want to be provided as a prop to every component (a common use-case is informationa about the authenticated user) you can use the `sails.inertia.share` method.

In Sails having a custom hook by running `sails generate hook custom` will scaffolding a project level hook in which you can share the loggedIn user information for example. Below is a real world use case:

```js
/**
 * custom hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

module.exports = function defineCustomHook(sails) {
  return {
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function () {
      sails.log.info("Initializing custom hook (`custom`)");
    },
    routes: {
      before: {
        "GET /": {
          skipAssets: true,
          fn: async function (req, res, next) {
            if (req.session.userId) {
              const loggedInUser = await User.findOne({
                id: req.session.userId,
              });
              if (!loggedInUser) {
                sails.log.warn(
                  "Somehow, the user record for the logged-in user (`" +
                    req.session.userId +
                    "`) has gone missing...."
                );
                delete req.session.userId;
                return res.redirect("/signin");
              }
              sails.inertia.share("loggedInUser", loggedInUser);
              return next();
            }
            return next();
          },
        },
      },
    },
  };
};
```

## Configuration

If you used the `create-sails` scaffolding tool, you will find the configuration file for Inertia.js in `config/inertia.js`. You will mostly use this file for asset-versioning in Inertia by setting either a number or string that you can update when your assets changes. Below is an example of how this file looks like:

```js
/**
 * Inertia configuration
 * (sails.config.inertia)
 *
 * Use the settings below to configure session integration in your app.
 *
 * For more information on Inertia configuration, visit:
 * https://inertia-sails.sailscasts.com
 */

module.exports.inertia = {
  /**
   * https://inertiajs.com/asset-versioning
   * You can pass a string, number that changes when your assets change
   *  or a function that returns the said string, number.
   * e.g 4 or () => 4
   */
  // version: 1,
};
```

Visit [inertiajs.com](https://inertiajs.com/) to learn more.
