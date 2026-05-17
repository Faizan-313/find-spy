import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { getSocket } from "../socket/client";
import toast from "react-hot-toast";
import type { socketRoom } from "../types/types"
import { validateAgentName, normalizeRoomCode, validateRoomCodeFormat } from "../utils/validation";

interface JoinRoomProps {
    roomCode: string;
    username: string;
}

const JoinRoom = () => {
    const [data, setData] = useState<JoinRoomProps>({
        roomCode: "",
        username: ""
    });
    const [loading, setLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const latestDataRef = useRef(data);
    const navigate = useNavigate();

    useEffect(() => {
        latestDataRef.current = data;
    }, [data]);

    useEffect(() => {
        const socket = getSocket();
        socketRef.current = socket;

        socket.on('error', (err: {message: string}) => {
            setLoading(false);
            toast.error(err.message || "An error occured while joining the room")
        })

        socket.on("roomUpdated", (response: socketRoom) => {
            setLoading(false);
            toast.success("Joined room successfully!");
            const currentUsername = latestDataRef.current.username;
            navigate('/room-waiting', {
                state: {
                    roomName: response.name,
                    roomCode: response.roomCode,
                    userName: currentUsername,
                    isHost: response.host === currentUsername,
                    players: response.players
                }
            });
        });

        socket.on("connect_error", () => {
            toast.error("Connection error. Please check your internet");
        });

        return () => {
            socket.off("error");
            socket.off("roomUpdated");
            socket.off("connect_error");
        };
    }, [navigate]);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const code = normalizeRoomCode(data.roomCode);
        const codeErr = validateRoomCodeFormat(code);
        if (codeErr) {
            toast.error(codeErr);
            return;
        }
        const an = validateAgentName(data.username);
        if (an) {
            toast.error(an);
            return;
        }

        setLoading(true);

        if (socketRef.current) {
            socketRef.current.emit('joinRoom', { roomCode: code, username: data.username.trim() });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "roomCode") {
            const next = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 32);
            setData((prev) => ({ ...prev, roomCode: next }));
            return;
        }
        setData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] sm:min-h-[85vh] bg-[#0a0a0a] flex items-center justify-center px-3 sm:px-4 py-8"
            style={{
                backgroundImage: `radial-gradient(ellipse at 60% 40%, rgba(0,255,100,0.04) 0%, transparent 60%),
                                    radial-gradient(ellipse at 20% 80%, rgba(255,0,0,0.04) 0%, transparent 50%)`
            }}>

            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`
                }} />

            <div className="w-full max-w-md relative">

                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <div className="h-px flex-1 bg-white/20" />
                    <span className="text-white/70 text-[10px] font-bold tracking-[0.3em] uppercase">
                        Join operation
                    </span>
                    <div className="h-px flex-1 bg-white/20" />
                </div>

                <div
                    className="relative border border-white/25 bg-white/[0.04] backdrop-blur-sm p-5 sm:p-8 shadow-[0_0_40px_rgba(255,255,255,0.04)]"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />

                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50" />

                    <span className="inline-block mb-3 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase border border-white/30 text-white/80 bg-white/5">
                        Guest · join
                    </span>
                    <h1
                        className="text-white text-2xl sm:text-3xl font-black tracking-[0.12em] sm:tracking-[0.15em] uppercase mb-1"
                        style={{ fontFamily: "'Arial Black', sans-serif", textShadow: '0 0 30px rgba(255,255,255,0.12)' }}
                    >
                        Join Room
                    </h1>
                    <p className="text-white/30 text-[10px] sm:text-xs tracking-widest uppercase mb-6 sm:mb-8">
                        Enter the invite code from your host
                    </p>

                    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-5 sm:gap-6">

                        <div className="flex flex-col gap-2">
                            <label className="text-white/75 text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-white/60" />
                                Room Code
                            </label>
                            <input
                                className="bg-white/5 border border-white/20 text-white px-4 py-3 text-sm tracking-[0.35em] sm:tracking-wider placeholder:text-white/25 outline-none transition-all duration-200
                                            focus:border-white/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] font-mono"
                                type="text"
                                inputMode="text"
                                autoCapitalize="characters"
                                spellCheck={false}
                                value={data.roomCode}
                                onChange={handleChange}
                                name="roomCode"
                                placeholder="K7ZQ4M"
                                maxLength={32}
                                disabled={loading}
                                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                            />
                            <p className="text-white/20 text-[9px] tracking-wide">
                                6-character code, or older longer codes (letters and digits)
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-white/75 text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-white/60" />
                                Agent Name
                            </label>
                            <input
                                className="bg-white/5 border border-white/20 text-white px-4 py-3 text-sm tracking-wider placeholder:text-white/25 outline-none transition-all duration-200
                                            focus:border-white/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                                type="text"
                                value={data.username}
                                onChange={handleChange}
                                name="username"
                                placeholder="GHOST"
                                maxLength={24}
                                autoComplete="username"
                                disabled={loading}
                                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                            />
                            <p className="text-white/20 text-[9px] tracking-wide">
                                2–24 characters: letters, numbers, spaces, - or _
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 sm:mt-2 w-full bg-white text-black font-black text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase px-6 sm:px-8 py-3.5 sm:py-4 cursor-pointer
                                        transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                            {loading ? "Joining..." : "Join Room"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;

