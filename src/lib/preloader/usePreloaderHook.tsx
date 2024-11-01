import { useState, useEffect } from "react";

export function usePreloader(fetchData: () => Promise<any>) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const result = await fetchData();
        setData(result || null); // Handle `null` or undefined response
      } catch (error: any) {
        console.error("Fetch error:", error);
        setError(error.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { data, isLoading, error, setData, setIsLoading };
}
