import type { APIErrorResponse, APIResponse } from "@/types/api.types";

const URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";
type APIResult<T> = {
  response?: APIResponse<T>
  error?: APIErrorResponse
}

type APIFunction = <T>(endpoint: string, body: unknown) => Promise<APIResult<T>>;

export const GET: APIFunction = async <T>(endpoint: string) => {
  console.log("GET: ", endpoint)
  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.json() as APIErrorResponse
      return { error: err }
    }
    const data = await response.json() as APIResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};

export const POST: APIFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as APIErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } }

    const data = await response.json() as APIResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};


export const PUT: APIFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as APIErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } }

    const data = await response.json() as APIResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};

export const PATCH: APIFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as APIErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } }

    const data = await response.json() as APIResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};


export const DELETE: APIFunction = async <T>(endpoint: string) => {
  try {
    const response = await fetch(`${URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const err = await response.json() as APIErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } }

    const data = await response.json() as APIResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};

