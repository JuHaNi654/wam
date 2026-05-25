const URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(endpoint: string, options?: RequestInit): Promise<any | null> {
  try {
  const response = await fetch(`${URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
  }
  return response.json();
  } catch (error) {
    console.error(error);
    null
  }
}

export async function POST<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? response.statusText);
  }
  return response.json();
}

export async function PATCH<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? response.statusText);
  }
  return response.json();
}