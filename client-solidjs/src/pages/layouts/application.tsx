import { createRoute } from "@tanstack/solid-router";
import Layout from "./base"

export default createRoute({
  getParentRoute: () => Layout,
  path: "applications",
})
