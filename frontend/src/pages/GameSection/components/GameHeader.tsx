import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "react-hot-toast/headless";
import type { GameState } from "../../../types/types";
import { formatTime } from "../../../utils/utils";

type GameHeaderProps = {
    roomName: string;
    word: string;
    isSpy: boolean;
    gameState: GameState;
    isVotingPhase: boolean;
    votingTimer: number;
    onLeaveRoom: () => void;
    roomCode: string;
};

const clip =
    "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))";

const GameHeader = ({
    roomName,
    word,
    isSpy,
    gameState,
    isVotingPhase,
    votingTimer,
    onLeaveRoom,
    roomCode,
}: GameHeaderProps) => {
    const [codeCopied, setCodeCopied] = useState(false);

    const stats = [
        {
            label: "Phase",
            value:
                gameState === "voting"
                    ? "Voting"
                    : gameState === "ended"
                      ? "Ended"
                      : "Discussion",
        },
        { label: "Timer", value: isVotingPhase ? formatTime(votingTimer) : "--:--" },
        { label: "Your Role", value: word ? (isSpy ? "Spy" : "Agent") : "…" },
    ];

    const code = roomCode?.trim() || "—";

    const handleCopyCode = async () => {
        if (!roomCode?.trim()) return;
        try {
            await navigator.clipboard.writeText(roomCode);
            setCodeCopied(true);
            window.setTimeout(() => setCodeCopied(false), 2000);
        } catch {
            toast.error("Could not copy room code");
        }
    };

    return (
        <div
            className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-white/2 px-5 py-4 md:px-6"
            style={{
                clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 shrink-0 rounded-full bg-[#00ff64] shadow-[0_0_8px_rgba(0,255,100,0.8)] animate-pulse" />
                <div className="min-w-0">
                    <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Room Name</p>
                    <p
                        className="text-white font-black text-base md:text-lg tracking-[0.2em] uppercase leading-none truncate"
                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                    >
                        {roomName}
                    </p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8 shrink-0">
                {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                        <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase">{stat.label}</p>
                        <p
                            className="text-[#00ff64] font-black text-sm tracking-[0.15em] uppercase"
                            style={{ fontFamily: "'Arial Black', sans-serif" }}
                        >
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center shrink-0">
                <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase">Your Word</p>
                <p className="text-[#1ec6af] font-black text-xs md:text-sm tracking-[0.15em] uppercase max-w-[140px] truncate">
                    "{word || "Waiting..."}"
                </p>
            </div>

            <div
                className="flex items-center gap-2 border border-[#00ff64]/25 bg-[#00ff64]/5 px-3 py-2 shrink-0"
                style={{ clipPath: clip }}
            >
                <div className="flex flex-col min-w-0">
                    <span className="text-[#00ff64]/80 text-[9px] font-bold tracking-[0.2em] uppercase">
                        Room code
                    </span>
                    <span
                        className="text-white font-black text-sm tracking-[0.25em]"
                        title={roomCode}
                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                    >
                        {code}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleCopyCode}
                    disabled={!roomCode?.trim()}
                    title="Copy room code"
                    className="shrink-0 p-2 border border-[#00ff64]/35 text-[#00ff64] hover:bg-[#00ff64]/15 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    style={{ clipPath: clip }}
                >
                    {codeCopied ? (
                        <CheckIcon className="w-4 h-4 text-[#00ff64]" aria-hidden />
                    ) : (
                        <CopyIcon className="w-4 h-4" aria-hidden />
                    )}
                    <span className="sr-only">Copy room code</span>
                </button>
            </div>

            <button
                type="button"
                onClick={onLeaveRoom}
                className="shrink-0 border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-400/60 text-[10px] tracking-[0.25em] uppercase px-4 py-2 cursor-pointer transition-all duration-200 active:scale-95"
                style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
            >
                Leave Room
            </button>
        </div>
    );
};

export default GameHeader;
