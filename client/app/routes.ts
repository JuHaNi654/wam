import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("job/new", "routes/job.new.tsx"),
  route("application/:id", "routes/application.$id.tsx"),
] satisfies RouteConfig;
