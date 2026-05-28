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
  try {
    const response = await GET<{ profile: Profile }>("/api/profile", null);
    if (!response.data.profile.id) throw new Error("empty profile");

    await next();
  } catch (err: any) {
    if (url.pathname !== "/") {
      throw redirect("/");
    }
  }
};

