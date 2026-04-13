import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

type User = {
    roomName: string;
    userName: string;
};

const CreateRoom = () => {
    const [data, setData] = useState<User>({
        roomName: "",
        userName: ""
    });
    const [loading, setLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        socket.on("connect_error", () => {
            toast.error("Connection error. Please check your internet");
        });

        return () => {
            socket.off('connect_error');
        };
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.roomName.trim() || !data.userName.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        if (socketRef.current) {
            socketRef.current.emit('createRoom', {
                roomName: data.roomName,
                userName: data.userName
            }, (response: { success: boolean; roomCode?: string; userName?: string; isHost?: boolean; players?: []; error?: string }) => {
                setLoading(false);

                if (response.success) {
                    toast.success("Room created successfully!");
                    // Navigate to room waiting page with room info
                    navigate('/room-waiting', {
                        state: {
                            roomCode: response.roomCode,
                            userName: response.userName,
                            isHost: response.isHost,
                            players: response.players
                        }
                    });
                } else {
                    toast.error(response.error || 'Failed to create room');
                }
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-[85vh] bg-[#0a0a0a] flex items-center justify-center px-4"
            style={{
                backgroundImage: `radial-gradient(ellipse at 60% 40%, rgba(0,255,100,0.04) 0%, transparent 60%),
                                    radial-gradient(ellipse at 20% 80%, rgba(255,0,0,0.04) 0%, transparent 50%)`
            }}>

            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`
                }} />

            <div className="w-full max-w-md relative">

                <div className="flex items-center gap-3 mb-8">
                    <div className="h-px flex-1 bg-[#00ff64]/30" />
                    <span className="text-[#00ff64] text-[10px] font-bold tracking-[0.3em] uppercase">
                        Classified Operation
                    </span>
                    <div className="h-px flex-1 bg-[#00ff64]/30" />
                </div>

                <div className="relative border border-white/10 bg-white/3 backdrop-blur-sm p-8"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>

                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff64]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff64]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff64]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff64]" />

                    <h1 className="text-white text-3xl font-black tracking-[0.15em] uppercase mb-1"
                        style={{ fontFamily: "'Arial Black', sans-serif", textShadow: '0 0 30px rgba(0,255,100,0.2)' }}>
                        Create Room
                    </h1>
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-8">
                        Initialize secure channel
                    </p>

                    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-6">

                        <div className="flex flex-col gap-2">
                            <label className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                                Room Name
                            </label>
                            <input
                                className="bg-transparent border border-white/10 text-white px-4 py-3 text-sm tracking-wider placeholder:text-white/20 outline-none transition-all duration-200
                                            focus:border-[#00ff64]/60 focus:bg-[#00ff64]/5 focus:shadow-[0_0_20px_rgba(0,255,100,0.1)]"
                                type="text"
                                value={data.roomName}
                                onChange={handleChange}
                                name="roomName"
                                placeholder="OPERATION_NIGHTFALL"
                                disabled={loading}
                                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                                <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                                Agent Name
                            </label>
                            <input
                                className="bg-transparent border border-white/10 text-white px-4 py-3 text-sm tracking-wider placeholder:text-white/20 outline-none transition-all duration-200
                                            focus:border-[#00ff64]/60 focus:bg-[#00ff64]/5 focus:shadow-[0_0_20px_rgba(0,255,100,0.1)]"
                                type="text"
                                value={data.userName}
                                onChange={handleChange}
                                name="userName"
                                placeholder="GHOST"
                                disabled={loading}
                                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-[#00ff64] text-black font-black text-sm tracking-[0.3em] uppercase px-8 py-4 cursor-pointer
                                        transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,100,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
                            {loading ? "Initializing..." : "Initialize Room"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;

//                         <div className="flex flex-col gap-2">
//                             <label className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
//                                 <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
//                                 Agent Name
//                             </label>
//                             <input
//                                 className="bg-transparent border border-white/10 text-white px-4 py-3 text-sm tracking-wider placeholder:text-white/20 outline-none transition-all duration-200
//                                             focus:border-[#00ff64]/60 focus:bg-[#00ff64]/5 focus:shadow-[0_0_20px_rgba(0,255,100,0.1)]"
//                                 type="text"
//                                 value={data.userName}
//                                 onChange={handleChange}
//                                 name="userName"
//                                 placeholder="GHOST"
//                                 style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             className="mt-2 bg-[#00ff64] text-black font-black text-sm tracking-[0.3em] uppercase px-8 py-4 cursor-pointer
//                                         transition-all duration-200 hover:bg-white hover:shadow-[0_0_40px_rgba(0,255,100,0.4)] active:scale-95"
//                             style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
//                             Initialize Room
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateRoom;