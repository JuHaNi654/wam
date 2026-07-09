const URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

type APIFunction = <T>(endpoint: string, body: unknown) => Promise<{ data: T }>;

export class ResponseError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ResponseError"
    this.statusCode = statusCode
  }
}

export const GET: APIFunction = async (endpoint: string) => {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new ResponseError(err.error ?? response.statusText, response.status);
  }
  return response.json();
};

export const POST: APIFunction = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new ResponseError(err.error ?? response.statusText, response.status);
  }

  if (response.status == 204) return null

  return response.json();
};


export const PUT: APIFunction = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new ResponseError(err.error ?? response.statusText, response.status);
  }

  if (response.status === 204) return null
  return response.json();
};

export const PATCH: APIFunction = async (endpoint: string, body: unknown) => {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new ResponseError(err.error ?? response.statusText, response.status);
  }
  return response.json();
};


export const DELETE = async (endpoint: string): Promise<null> => {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new ResponseError(err.error ?? response.statusText, response.status);
  }

  return null
};

