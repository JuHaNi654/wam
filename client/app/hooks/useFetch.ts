import { useState, useEffect, useCallback } from "react";

const URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

function useFetch<T>(path: string): {
  response: T | null;
  loading: boolean;
  error: any | null;
  refetch: () => void;
} {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const response = await fetch(`${URL}${path}`);
        if (!response.ok) {
          throw new Error(`Error fetching ${path}: ${response.statusText}`);
        }
        const result = await response.json();
        setResponse(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [path, tick]);

  console.log(`useFetch (${path})`);
  console.log("Response: ", response);
  console.log("Loading: ", loading);
  console.log("Error: ", error);

  return { response, loading, error, refetch };
}

export default useFetch;

