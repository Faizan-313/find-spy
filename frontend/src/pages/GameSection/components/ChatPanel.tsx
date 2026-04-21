import type { ChatMessage } from "../../../types/types";

type ChatPanelProps = {
    messages: ChatMessage[];
    input: string;
    onInputChange: (value: string) => void;
    onSend: () => void;
};

const ChatPanel = ({ messages, input, onInputChange, onSend }: ChatPanelProps) => {
    return (
        <div
            className="flex flex-col border border-white/10 bg-white/2"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                    Chat
                </p>
                <span className="text-white/20 text-[9px] tracking-widest uppercase">Encrypted</span>
            </div>

            <div className="h-52 px-5 py-4 flex flex-col gap-3 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/30 text-xs">
                        No messages yet
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-white/20 text-[9px] tracking-widest mt-0.5 shrink-0">{m.time}</span>
                            <div>
                                <span
                                    className="text-[#00ff64] text-[10px] font-black tracking-[0.15em] uppercase mr-2"
                                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                                >
                                    {m.agent}
                                </span>
                                <span className="text-white/60 text-xs tracking-wide">{m.msg}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="px-5 py-3 border-t border-white/6 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSend();
                    }}
                    placeholder="Transmit message..."
                    className="flex-1 bg-transparent border border-white/10 text-white text-xs tracking-wider px-3 py-2 placeholder:text-white/20 outline-none focus:border-[#00ff64]/40 transition-colors duration-200"
                    style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                />
                <button
                    onClick={onSend}
                    className="bg-[#00ff64]/10 border border-[#00ff64]/30 text-[#00ff64] text-[10px] tracking-[0.2em] uppercase px-4 py-2 hover:bg-[#00ff64]/20 cursor-pointer transition-all duration-150 active:scale-95"
                    style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
