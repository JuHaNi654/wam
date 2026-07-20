import { redirect, type MiddlewareFunction } from "react-router";
import type { Profile } from "./types/api.types";
import { GET } from "./lib/api";

export const loggingMiddleware: MiddlewareFunction = async ({ request }, next) => {
  console.log(`${new Date().toISOString()} ${request.method} ${request.url}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`${new Date().toISOString()} (${duration}ms)`);
};

export const isInitialized: MiddlewareFunction = async ({ request }, next) => {
  const url = new URL(request.url);
  const { error } = await GET<Profile>("/api/profile/initialized", null);
  if (error && url.pathname !== "/") {
    throw redirect("/");
  }

  if (url.pathname === "/") throw redirect("/dashboard")

  next()
};

