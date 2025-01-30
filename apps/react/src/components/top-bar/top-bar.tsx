import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WalletBalance } from "./wallet-balance";
import { useServer } from "../../hooks/use-server";

export default function TopBar({ className }: { className?: string }) {
  const [serverStatus, setServerStatus] = useState<string | number>("Unknown");

  const server = useServer();

  useEffect(() => {
    getServerStatus();
  }, []);

  const getServerStatus = async () => {
    const status = await server.getStatus.query();
    console.log("status", status.status);
    setServerStatus(status.status);
  };

  return (
    <div
      className={`flex justify-between items-center h-16 bg-black/50  [filter:url(#noise)] ${className}`}
    >
      <Link to="/">
        <div className="flex items-center gap-2 ml-2 px-1 justify-center bg-black hover:bg-black/90">
          <div className="flex flex-col">
            <h1 className={cn("text-2xl font-bold")}>news</h1>
          </div>
        </div>
      </Link>
      <div className="text-white mr-4">Server Status: {serverStatus}</div>
      <button onClick={() => getServerStatus()}>Get Status</button>
      <WalletBalance />
    </div>
  );
}
