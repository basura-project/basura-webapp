import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sha256 } from "js-sha256"; // You can use any hash library to generate a simple hash

export function usePreloader(fetchData: () => Promise<any>, name: string) {

  const [data, setData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setIsDataLoading(true);
      try {
        const result = await fetchData();
        setData(result || null);

        const newHash = sha256(JSON.stringify(result)); // Generate hash from data
        const storedHash = sessionStorage.getItem(`${name}_dataHash`);

        // Show toast if data has changed or if this is the first fetch
        if (newHash !== storedHash) {
          toast({
            title: "Successful",
            description: `${name} list has been updated.`,
          });
          sessionStorage.setItem(`${name}_dataHash`, newHash);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        setError(error.message || "Failed to load data.");
      } finally {
        setIsDataLoading(false);
      }
    })();
  }, [fetchData, name, toast]);

  return { data, isDataLoading, error, setData, setIsDataLoading };
}
