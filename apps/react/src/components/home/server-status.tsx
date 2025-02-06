import { useEffect, useState } from "react";
import { useServer } from "../../hooks/useServer";
import { cn } from "../../utils/cn";
import { useSlot } from "../../hooks/useSlot";

export default function ServerStatus() {
    const [serverStatus, setServerStatus] = useState<{
        status: string | number;
        color: string;
    }>({ status: "Unknown", color: "grey" });
    const server = useServer();
    const { slot } = useSlot();

    useEffect(() => {
        getServerStatus();
    }, []);

    const getServerStatus = async () => {
        try {
            const status = await server.getStatus.query();

        let color = "bg-grey-500";
        if (status.status === 200) {
            color = "bg-green-700";
        } else {
            color = "bg-red-500";
            }

            setServerStatus({ status: status.status, color });
        } catch {
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
            <br />
            Slot {slot}
        </div>
    );
}
