import { useEffect, useState } from "react";
import { useServer } from "../../hooks/useServer";
import { cn } from "../../utils/cn";

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
        try {
            const status = await server.getStatus.query();
            console.log("Server status", status);

        let color = "bg-grey-500";
        if (status.status === 200) {
            color = "bg-green-700";
        } else {
            color = "bg-red-500";
            }

            setServerStatus({ status: status.status, color });
        } catch (error) {
            console.error("Error fetching server status", error);
            setServerStatus({ status: "400", color: "bg-red-500" });
        }
    };

    return (
        <div
            className={cn(
                `fixed bottom-2 right-2 ${serverStatus.color} text-white p-2 rounded`
            )}
        >
            Server {serverStatus.status}
        </div>
    );
}
