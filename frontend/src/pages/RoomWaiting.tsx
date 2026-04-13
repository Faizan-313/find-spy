import { Copy, CopyCheck } from "lucide-react";
import {  useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client"

const Room = () => {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL, { 
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        socketRef.current = socket;
        
        socket.on('connect', ()=>{
            socket.emit("joinRoom", {room: 'room h'});
            
            socket.emit('submit_vote', {room: 'room h', username: "username"})
        })

        socket.on("connect_error", () => {
            toast.error("Connection error. Please check your internet")
        })
    })
        
    

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

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-px w-8 bg-[#00ff64]/50" />
                            <span className="text-[#00ff64] text-[10px] font-bold tracking-[0.3em] uppercase">
                                Classified Operation
                            </span>
                        </div>
                        <h1
                            className="text-white text-5xl font-black tracking-[0.12em] uppercase leading-none"
                            style={{
                                fontFamily: "'Arial Black', sans-serif",
                                textShadow: "0 0 40px rgba(0,255,100,0.15)",
                            }}
                        >
                            ONE OF YOU
                            <br />
                            <span className="text-[#00ff64]">IS THE SPY</span>
                        </h1>
                        <p className="text-white/30 text-xs tracking-[0.25em] uppercase mt-3">
                            Trust no one. Uncover everything.
                        </p>
                    </div>

                    <div
                        className="border border-white/10 bg-white/3 px-5 py-4 text-right"
                        style={{
                            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                        }}
                    >
                        <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-1">Operation</p>
                        <p
                            className="text-[#00ff64] text-xl font-black tracking-[0.2em]"
                            style={{ fontFamily: "'Arial Black', sans-serif" }}
                        >
                            {roomName}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff64] animate-pulse" />
                            <span className="text-white/30 text-[9px] tracking-widest uppercase">Live</span>
                        </div>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase">
                        Agents Online · {players.length}/8
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 flex flex-col gap-3">
                        <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                            Active Agents
                        </p>

                        {players.map((player, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between border border-white/10 bg-white/2 px-5 py-4 transition-all duration-200 hover:border-white/20 hover:bg-white/4"
                                style={{
                                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 text-xs font-bold"
                                        style={{
                                            clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                                        }}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-white font-black text-sm tracking-[0.15em] uppercase"
                                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                                            >
                                                {player.name}
                                            </span>
                                            {player.name === userName && (
                                                <span className="text-[#00ff64] text-[9px] tracking-widest uppercase border border-[#00ff64]/30 px-1.5 py-0.5">
                                                    You
                                                </span>
                                            )}
                                            {player.isHost && (
                                                <span className="text-white/40 text-[9px] tracking-widest uppercase border border-white/10 px-1.5 py-0.5">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="flex items-center gap-4 border border-white/5 border-dashed px-5 py-4"
                                style={{
                                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                }}
                            >
                                <div className="w-9 h-9 border border-white/5 border-dashed flex items-center justify-center"
                                    style={{ clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))" }}
                                />
                                <span className="text-white/15 text-xs tracking-[0.2em] uppercase">Awaiting agent...</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <div
                            className="border border-[#00ff64]/20 bg-[#00ff64]/3 p-5"
                            style={{
                                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                            }}
                        >
                            <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
                                Invite Code
                            </p>
                            <div className="flex items-center gap-2">
                                <span
                                    className="flex-1 text-white font-black text-lg tracking-[0.3em]"
                                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                                >
                                    {roomName}
                                </span>
                                {!copy ? <Copy color="white" className="cursor-pointer active:scale-75" onClick={handleCopy}/> : <CopyCheck color="white" />}
                            </div>
                        </div>

                        <div
                            className="border border-white/10 bg-white/2 p-5"
                            style={{
                                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                            }}
                        >
                            <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2 mb-4">
                                <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                                Mission Brief
                            </p>
                            <ul className="flex flex-col gap-3">
                                {[
                                    { label: "Mode", value: "Classic" },
                                    { label: "Agents", value: `${players.length} / 8` },
                                    { label: "Status", value: "Lobby" },
                                ].map((item) => (
                                    <li key={item.label} className="flex items-center justify-between">
                                        <span className="text-white/30 text-xs tracking-widest uppercase">{item.label}</span>
                                        <span className="text-white text-xs font-bold tracking-wider uppercase">{item.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto">
                            {isHost ? (
                                <button
                                    className="bg-[#00ff64] text-black font-black text-sm tracking-[0.3em] uppercase px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,100,0.3)] active:scale-95"
                                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                >
                                    Launch Mission
                                </button>
                            ) : (
                                <button
                                    className="bg-[#00ff64] text-black font-black text-sm tracking-[0.3em] uppercase px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,100,0.3)] active:scale-95"
                                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                >
                                    Ready Up
                                </button>
                            )}
                            <button
                                className="border border-white/10 text-white/40 hover:text-white hover:border-white/30 font-bold text-sm tracking-[0.2em] uppercase px-6 py-3 cursor-pointer transition-all duration-200 active:scale-95"
                                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                            >
                                Leave Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Room;