import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import "~/css/main.css";

createInertiaApp({
  title: () => "RITS stack",
  resolve: (name) => require(`./pages/${name}`),
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: "#29d",
  },
});
