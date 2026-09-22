import type { TApiResult, TApiErrorResponse, TApiResponse } from "../models/models";
import { API_URL } from "./constants";

type ApiFunction = <T>(endpoint: string, body: unknown) => Promise<TApiResult<T>>;

export const GET: ApiFunction = async <T>(endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.json() as TApiErrorResponse
      return { error: err }
    }
    const data = await response.json() as TApiResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
}

export const POST: ApiFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as TApiErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } as TApiResponse<T> }

    const data = await response.json() as TApiResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
}

export const PUT: ApiFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as TApiErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } as TApiResponse<T> }

    const data = await response.json() as TApiResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
}

export const PATCH: ApiFunction = async <T>(endpoint: string, body: unknown) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json() as TApiErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } as TApiResponse<T> }

    const data = await response.json() as TApiResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};

export const DELETE: ApiFunction = async <T>(endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const err = await response.json() as TApiErrorResponse
      return { error: err }
    }

    if (response.status == 204) return { response: { status: 204 } as TApiResponse<T> }

    const data = await response.json() as TApiResponse<T>
    return { response: data }
  } catch (err: unknown) {
    console.error("API network failure")
    console.error(err)
    return { error: { status: 500, message: "service unavailable" } }
  }
};
