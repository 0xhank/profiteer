import { useState } from "react";
import { useServer } from "../../hooks/useServer";
import supabase from "../../sbClient";

export const Migrate = () => {
    const { migrate } = useServer();
    const [migrations, setMigrations] = useState<
        {
            complete: boolean | null;
            created_at: string;
            migrated: boolean | null;
            mint: string,
        }[]
    >([]);
    const [computeUnitPriceMicroLamports, setComputeUnitPriceMicroLamports] = useState<number>(1000000);
    const getPendingMigrations = async () => {
        const { data, error } = await supabase
            .from("token_migration")
            .select("*")
            .eq("migrated", false);
        if (error) {
            console.error(error);
            return
        }
        setMigrations(data);
    };


    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Pending Migrations</h2>
            {migrations.map((token) => (
                <div key={token.mint} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                    <div>
                        <p className="font-medium">{token.mint.slice(0, 4)}...{token.mint.slice(-4)}</p>
                    </div>
                    <button
                        onClick={() => getPendingMigrations()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        refresh
                    </button>
                    <input
                        type="number"
                        value={computeUnitPriceMicroLamports}
                        onChange={(e) => setComputeUnitPriceMicroLamports(Number(e.target.value))}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    />
                    <button
                        onClick={() => migrate.mutate({ mint: token.mint, computeUnitPriceMicroLamports: computeUnitPriceMicroLamports })}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Migrate
                    </button>
                </div>
            ))}
            {!migrations.length && (
                <p className="text-gray-600">No pending migrations available.</p>
            )}
        </div>
    );
};