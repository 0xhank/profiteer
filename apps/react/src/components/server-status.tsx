import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { useServer } from "../hooks/use-server";

export default function ServerStatus() {
  const [serverStatus, setServerStatus] = useState<{
    status: string | number;
    color: string;
  }>({ status: "Unknown", color: "grey" });
  const server = useServer();

  useEffect(() => {
    getServerStatus();
  }, []);

  const getServerStatus = async () => {
    const status = await server.getStatus.query();

    let color = "bg-grey-500";
    if (status.status === 200) {
      color = "bg-green-700";
    } else if (status.status >= 400) {
      color = "bg-red-500";
    }

    setServerStatus({ status: status.status, color });
  };

  const initializeServer = async () => {
    try {
      const response = await server.initialize.mutate();
      alert(response.message); // Show the success message
    } catch (error) {
      console.error("Initialization failed", error);
    }
  };

  return (
    <div
      className={cn(
        `fixed bottom-2 right-2 ${serverStatus.color} text-white p-2 rounded`
      )}
    >
      Server {serverStatus.status}
      <button
        onClick={initializeServer}
        className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
      >
        Initialize
      </button>
    </div>
  );
}
