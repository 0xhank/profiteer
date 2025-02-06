export default function MaintenancePage() {
    return (
        <div className="relative min-h-screen w-full">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                style={{ backgroundImage: 'url("/cloud-bg.webp")' }}
            />
            <div className="relative flex min-h-screen items-center justify-center animate-pulse">
                <img
                    src="/profiteer.webp"
                    alt="Maintenance"
                    className="max-w-16"
                />
            </div>
        </div>
    );
}
