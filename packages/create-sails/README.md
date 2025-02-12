# create-sails

An easy way to start a modern full-stack Sails project.

## Usage

```sh
npx create-sails@latest <project-name>
```

or

```sh
npm init sails
```

## What you will get with this scaffolding:

- [Inertia.js](https://inertiajs.com) powered by [inertia-sails](https://github.com/sailscastshq/create-sails)
- [Vue 3](https://vuejs.org)/[React](https://reactjs.org)/[Svelte](https://svelte.dev) setup depending on the frontend framework you choose.
- [Tailwind CSS](https://tailwindcss.com)
- [Webpack 5](https://webpack.js.org)

## Configuration

This scaffolding uses Webpack 5 for managing your Frontend assets. This is done via a project level hook called `webpack` which you can find in `config/webpack.js`. You can edit this file if you are familiar with Webpack or you want something more custom. But out of the box this should be good to go for 90% of projects.
