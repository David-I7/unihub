import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

async function apiCall(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("API call successful!");
    }, 1000);
  });
}

export default function TestPage() {
  const { data, isFetching } = useQuery({
    queryKey: ["test"],
    queryFn: apiCall,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
  const [count, setCount] = useState(0);

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Test Page</h1>
      <p className="mt-4 text-lg text-gray-600">
        This is a test page for development purposes.
        {data}
      </p>
      <p className="mt-2 text-lg text-gray-600">Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Decrement
      </button>
    </div>
  );
}
