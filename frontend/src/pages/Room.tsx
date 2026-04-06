const Room = () => {
    // Mock data 
    const roomName = "NIGHTFALL";
    const userName = "GHOST";
    const players = [
        { name: "GHOST", isHost: true, isReady: true },
        { name: "VIPER", isHost: false, isReady: true },
        { name: "CIPHER", isHost: false, isReady: false },
        { name: "WRAITH", isHost: false, isReady: false },
    ];
    const isHost = true;

    return (
        <div
            className="min-h-screen bg-[#0a0a0a] flex flex-col px-4 py-8"
            style={{
                backgroundImage: `radial-gradient(ellipse at 60% 40%, rgba(0,255,100,0.04) 0%, transparent 60%),
                                    radial-gradient(ellipse at 20% 80%, rgba(255,0,0,0.04) 0%, transparent 50%)`,
            }}
        >
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`,
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
                

                
            </div>
        </div>
    );
};

export default Room;