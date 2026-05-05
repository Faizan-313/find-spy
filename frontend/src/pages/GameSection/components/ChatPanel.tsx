import type { ChatMessage, Player } from "../../../types/types";
import { useRef, useEffect, useMemo } from "react";
import { getAvatarColor } from "../../../utils/utils";

type ChatPanelProps = {
    messages: ChatMessage[];
    input: string;
    onInputChange: (value: string) => void;
    onSend: () => void;
    isTyping: Set<string>;
    userName: string;
    players: Player[];
};

const cornerClip =
    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))";
const innerClip =
    "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))";

const ChatPanel = ({
    messages,
    input,
    onInputChange,
    onSend,
    isTyping,
    userName,
    players,
}: ChatPanelProps) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Stable color per agent based on their index in the player list,
    // matching the palette PlayerList uses so identities stay consistent.
    const colorByAgent = useMemo(() => {
        const map = new Map<string, { from: string; to: string }>();
        players.forEach((p, i) => map.set(p.name, getAvatarColor(i)));
        return map;
    }, [players]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const typingNames = Array.from(isTyping).filter((n) => n !== userName);

    return (
        <div
            className="flex flex-col border border-white/10 bg-white/2 backdrop-blur-sm"
            style={{ clipPath: cornerClip }}
        >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64] shadow-[0_0_6px_rgba(0,255,100,0.8)]" />
                    Secure Channel
                </p>
                <span className="text-white/30 text-[9px] tracking-widest uppercase flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64] animate-pulse" />
                    Encrypted
                </span>
            </div>

            <div
                ref={messagesContainerRef}
                className="h-72 px-5 py-4 flex flex-col gap-4 overflow-y-auto chat-scroll"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">
                            Awaiting Transmission
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
                            <span
                                className="w-1 h-1 rounded-full bg-white/20 animate-pulse"
                                style={{ animationDelay: "150ms" }}
                            />
                            <span
                                className="w-1 h-1 rounded-full bg-white/20 animate-pulse"
                                style={{ animationDelay: "300ms" }}
                            />
                        </div>
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isSelf = m.agent === userName;
                        const color =
                            colorByAgent.get(m.agent) ?? { from: "#888", to: "#555" };

                        return (
                            <div
                                key={i}
                                className={`flex items-end gap-2 ${
                                    isSelf ? "flex-row-reverse" : "flex-row"
                                }`}
                            >
                                <div
                                    className="w-7 h-7 shrink-0 flex items-center justify-center text-black text-[10px] font-black tracking-wide"
                                    style={{
                                        clipPath: innerClip,
                                        background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                                        fontFamily: "'Arial Black', sans-serif",
                                    }}
                                >
                                    {m.agent.slice(0, 2).toUpperCase()}
                                </div>

                                <div
                                    className={`flex flex-col max-w-[78%] min-w-0 ${
                                        isSelf ? "items-end" : "items-start"
                                    }`}
                                >
                                    <div
                                        className={`flex items-baseline gap-2 mb-1 ${
                                            isSelf ? "flex-row-reverse" : "flex-row"
                                        }`}
                                    >
                                        <span
                                            className="text-[9px] font-black tracking-[0.2em] uppercase"
                                            style={{
                                                fontFamily: "'Arial Black', sans-serif",
                                                color: color.from,
                                            }}
                                        >
                                            {isSelf ? "You" : m.agent}
                                        </span>
                                        <span className="text-white/25 text-[8px] tracking-widest">
                                            {m.time}
                                        </span>
                                    </div>

                                    <div
                                        className={`px-3 py-2 border text-xs tracking-wide leading-relaxed break-words ${
                                            isSelf
                                                ? "bg-[#00ff64]/8 border-[#00ff64]/25 text-white"
                                                : "bg-white/4 border-white/10 text-white/90"
                                        }`}
                                        style={{ clipPath: innerClip }}
                                    >
                                        {m.msg}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="px-5 h-6 flex items-center border-t border-white/6">
                {typingNames.length > 0 ? (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#00ff64] animate-pulse" />
                            <span
                                className="w-1 h-1 rounded-full bg-[#00ff64] animate-pulse"
                                style={{ animationDelay: "150ms" }}
                            />
                            <span
                                className="w-1 h-1 rounded-full bg-[#00ff64] animate-pulse"
                                style={{ animationDelay: "300ms" }}
                            />
                        </div>
                        <span className="text-[#00ff64]/70 text-[9px] tracking-[0.2em] uppercase truncate">
                            {typingNames.join(", ")}{" "}
                            {typingNames.length === 1 ? "is" : "are"} typing
                        </span>
                    </div>
                ) : (
                    <span className="text-white/15 text-[9px] tracking-[0.2em] uppercase">
                        Channel idle
                    </span>
                )}
            </div>

            <div className="px-5 py-3 border-t border-white/6 flex gap-3">
                <div
                    className="flex-1 relative bg-black/30 border border-white/10 focus-within:border-[#00ff64]/50 focus-within:shadow-[0_0_12px_rgba(0,255,100,0.15)] transition-all duration-200"
                    style={{ clipPath: innerClip }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSend();
                        }}
                        placeholder="Transmit message..."
                        className="w-full bg-transparent text-white text-xs tracking-wider px-3 py-2.5 placeholder:text-white/25 outline-none"
                    />
                </div>
                <button
                    onClick={onSend}
                    disabled={!input.trim()}
                    className="bg-[#00ff64]/10 border border-[#00ff64]/30 text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase px-5 py-2.5 hover:bg-[#00ff64]/20 hover:shadow-[0_0_12px_rgba(0,255,100,0.25)] cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#00ff64]/10 disabled:hover:shadow-none flex items-center gap-2"
                    style={{ clipPath: innerClip }}
                >
                    Send
                    <span className="text-base leading-none">→</span>
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
