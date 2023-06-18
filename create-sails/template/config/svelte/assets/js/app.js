import { createInertiaApp } from "@inertiajs/svelte";
import "~/css/main.css";

createInertiaApp({
  title: () => "SITS stack",
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    new App({ target: el, props });
  },
  progress: {
    color: "#29d",
  },
});
