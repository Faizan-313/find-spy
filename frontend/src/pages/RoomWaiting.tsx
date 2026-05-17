import { useLocation, useNavigate } from "react-router-dom";
import type { Player } from "../types/types";
import type { Socket } from "socket.io-client";
import { disconnectSocket, getSocket } from "../socket/client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CheckIcon, CopyIcon } from "lucide-react";
import PlayerWinBadge from "../components/PlayerWinBadge";

const RoomWaiting = () => {
    const location = useLocation();

    const { roomName, roomCode, userName, isHost, players} = location.state;
    const socketRef = useRef<Socket | null>(null);
    const [roomPlayers, setRoomPlayers] = useState<Player[]>(players);
    const [isLeaving, setIsLeaving] = useState(false);
    const navigation = useNavigate();
    
    useEffect(() => {
        const socket = getSocket();
        socketRef.current = socket;

        const emitJoin = () => {
            socket.emit("joinRoom", {
                roomCode,
                username: userName,
            });
        };

        socket.on("connect", emitJoin);
        if (socket.connected) {
            emitJoin();
        }

        socket.on("roomUpdated", (roomData: { players?: Player[] }) => {
            if (!roomData?.players) return;
            setRoomPlayers((prev) => {
                const next = roomData.players!;
                const nextNames = new Set(next.map((p) => p.name));
                for (const p of prev) {
                    if (!nextNames.has(p.name)) {
                        toast.success(`${p.name} has left the room`);
                    }
                }
                return next;
            });
        });

        socket.on("error", (err: { message?: string }) => {
            if (err?.message) {
                toast.error(err.message);
            }
        });

        socket.on("roomEnded", (msg) => {
            toast.error(msg.message || "The room has been closed by the host");
            navigation("/create-room");
        });

        socket.on("leftRoom", () => {
            setIsLeaving(false);
            disconnectSocket();
            navigation("/create-room");
        });

        socket.on("gameStarted", () => {
            toast.success("Mission is starting!");
            navigation("/game", {
                state: {
                    roomCode,
                    userName,
                    roomName,
                    players: roomPlayers,
                }
            })
        })

        socket.on("connect_error", () => {
            toast.error("Connection error. Please check your internet");
        });

        return () => {
            socket.off("connect", emitJoin);
            socket.off("roomUpdated");
            socket.off("error");
            socket.off("roomEnded");
            socket.off("leftRoom");
            socket.off("gameStarted");
            socket.off("connect_error");
        };
    }, [navigation, roomCode, userName, roomName]);


    const handleLeave = () => {
        if (isLeaving) return;

        const data = {
            roomCode,
            username: userName
        }
        if (!socketRef.current) {
            navigation("/create-room");
            return;
        }

        setIsLeaving(true);
        socketRef.current.emit("leaveRoom", data);

        setTimeout(() => {
            setIsLeaving(false);
            navigation("/create-room");
        }, 3000);
    }

    const handleLaunchGame = () => {
        if (!socketRef.current) return;
        if (roomPlayers.length < 2) {
            toast.error("Only one player in the lobby. Invite another agent before starting.");
            return;
        }
        socketRef.current.emit("startGame", { roomCode, username: userName });
    };

    const [isCopied, setIsCopied] = useState(false);
    const handleCopyInviteCode = () => {
        navigator.clipboard.writeText(roomCode);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    return (
        <div
            className="min-h-screen bg-[#0a0a0a] flex flex-col px-3 sm:px-4 py-6 sm:py-8 pb-12 overflow-x-hidden max-w-[100vw]"
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

            <div className="relative z-10 max-w-5xl mx-auto w-full min-w-0 flex flex-col gap-6 lg:gap-8">

                <div className="flex flex-col-reverse lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-px w-8 bg-[#00ff64]/50 shrink-0" />
                            <span className="text-[#00ff64] text-[10px] font-bold tracking-[0.3em] uppercase">
                                Classified Operation
                            </span>
                        </div>
                        <h1
                            className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.08em] sm:tracking-[0.12em] uppercase leading-[1.05] sm:leading-none"
                            style={{
                                fontFamily: "'Arial Black', sans-serif",
                                textShadow: "0 0 40px rgba(0,255,100,0.15)",
                            }}
                        >
                            ONE OF YOU
                            <br />
                            <span className="text-[#00ff64]">IS THE SPY</span>
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.25em] uppercase mt-3">
                            Trust no one. Uncover everything.
                        </p>
                    </div>

                    <div
                        className="border border-white/10 bg-white/3 px-4 sm:px-5 py-3 sm:py-4 lg:text-right shrink-0 w-full lg:max-w-xs"
                        style={{
                            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                        }}
                    >
                        <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-1">Operation</p>
                        <p
                            className="text-[#00ff64] text-lg sm:text-xl font-black tracking-[0.2em] break-words"
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

                <div className="flex items-center gap-4 min-w-0">
                    <div className="h-px flex-1 bg-white/10 min-w-[1rem]" />
                    <span className="text-white/20 text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase whitespace-nowrap shrink-0">
                        Agents · {roomPlayers.length}/8
                    </span>
                    <div className="h-px flex-1 bg-white/10 min-w-[1rem]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 flex flex-col gap-3">
                        <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                            Active Agents
                        </p>

                        {roomPlayers.map((player: Player, index: number) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between gap-3 border border-white/10 bg-white/2 px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-200 hover:border-white/20 hover:bg-white/4 min-w-0"
                                style={{
                                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                }}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <div
                                        className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 text-xs font-bold"
                                        style={{
                                            clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                                        }}
                                    >
                                        {String(index + 1).padStart(2, "0")}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className="text-white font-black text-sm tracking-[0.12em] uppercase truncate min-w-0"
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
                                            <PlayerWinBadge wins={player.winsInRoom ?? 0} />
                                        </div>
                                        <p className="text-white/25 text-[9px] tracking-widest uppercase mt-1">
                                            {(player.winsInRoom ?? 0) === 0
                                                ? "No wins yet"
                                                : `${player.winsInRoom} room win${player.winsInRoom === 1 ? "" : "s"}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {Array.from({ length: Math.max(0, 4 - roomPlayers.length) }).map((_, i) => (
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

                    <div className="flex flex-col gap-3 w-full min-w-0 max-w-full">
                        <div
                            className="border border-[#00ff64]/20 bg-[#00ff64]/3 p-4 sm:p-5"
                            style={{
                                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                            }}
                        >
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase pt-0.5">
                                    Invite Code
                                </p>
                                <button className="cursor-pointer text-white" onClick={handleCopyInviteCode}>
                                    {isCopied ? <CheckIcon className="w-4 h-4 cursor-pointer" /> : <CopyIcon className="w-4 h-4 cursor-pointer" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="flex-1 text-white font-mono font-black text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.3em] break-all"
                                >
                                    {roomCode}
                                </span>
                            </div>
                        </div>

                        <div
                            className="border border-white/10 bg-white/2 p-4 sm:p-5"
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
                                    { label: "Agents", value: `${roomPlayers.length} / 8` },
                                    { label: "Status", value: "Lobby" },
                                ].map((item) => (
                                    <li key={item.label} className="flex items-center justify-between">
                                        <span className="text-white/30 text-xs tracking-widest uppercase">{item.label}</span>
                                        <span className="text-white text-xs font-bold tracking-wider uppercase">{item.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto pt-1">
                            {isHost ? (
                                <button
                                    type="button"
                                    title={
                                        roomPlayers.length < 2
                                            ? "Need at least two players to launch"
                                            : undefined
                                    }
                                    className={`w-full min-h-[48px] flex items-center justify-center bg-[#00ff64] text-black font-black text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.26em] uppercase px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,100,0.3)] active:scale-[0.98] ${roomPlayers.length < 2 ? "opacity-60" : ""}`}
                                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                    onClick={handleLaunchGame}
                                >
                                    Launch mission
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="w-full min-h-[48px] flex items-center justify-center bg-[#00ff64]/15 border border-[#00ff64]/30 text-[#00ff64] font-bold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.22em] uppercase px-4 py-3.5 cursor-default"
                                    style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                >
                                    Waiting for host
                                </button>
                            )}
                            <button
                                className="w-full min-h-[48px] flex items-center justify-center border border-white/15 text-white/55 hover:text-white hover:border-white/35 hover:bg-white/5 font-bold text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase px-4 py-3 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                                style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                                onClick={handleLeave}
                                disabled={isLeaving}
                            >
                                {isLeaving ? "Leaving…" : "Leave room"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomWaiting;