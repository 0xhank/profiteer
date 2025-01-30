import { useEffect, useState } from "react";
import { useServer } from "../hooks/use-server";

const TimestampDisplay = () => {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const server = useServer();

  const fetchTimestamp = async () => {
    try {
      const response = await server.getMostRecentTimestamp.query();
      setTimestamp(response.recent_time);
    } catch (err) {
      console.error("Error fetching timestamp:", err);
      setError("Failed to fetch timestamp");
    }
  };
  useEffect(() => {
    fetchTimestamp();
  }, []);

  const refreshTimestamp = () => {
    setError(null);
    fetchTimestamp();
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="absolute bottom-2 left-2 p-4 bg-white/50 rounded shadow">
      <h2 className="text-lg font-bold">Most Recent Timestamp</h2>
      <p>{timestamp ? new Date(timestamp).toLocaleString() : "Loading..."}</p>
      <button
        onClick={refreshTimestamp}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh
      </button>
    </div>
  );
};

export default TimestampDisplay;
