import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { GameState } from "../../../types/types";
import { formatTime } from "../../../utils/utils";

type GameHeaderProps = {
    roomName: string;
    word: string;
    isSpy: boolean;
    isHost: boolean;
    gameState: GameState;
    isVotingPhase: boolean;
    votingTimer: number;
    onLeaveRoom: () => void;
    onBackToLobby: () => void;
    roomCode: string;
};

const clip = "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))";

const GameHeader = ({
    roomName,
    word,
    isSpy,
    isHost,
    gameState,
    isVotingPhase,
    votingTimer,
    onLeaveRoom,
    onBackToLobby,
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
            className="flex flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 border border-white/10 bg-white/2 px-3 py-3 sm:px-5 sm:py-4 md:px-6 w-full max-w-full min-w-0 overflow-hidden"
            style={{
                clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
        >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 basis-full sm:basis-auto sm:flex-1 lg:flex-initial">
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

            <div className="flex flex-col items-start shrink-0 w-full min-w-0 sm:w-auto sm:max-w-[10rem] md:max-w-none basis-full sm:basis-auto md:items-center">
                <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase">Your word</p>
                <p className="text-[#1ec6af] font-black text-[11px] sm:text-xs md:text-sm tracking-[0.12em] sm:tracking-[0.15em] uppercase w-full truncate">
                    "{word || "Waiting..."}"
                </p>
            </div>

            <div
                className="flex items-center gap-1.5 sm:gap-2 border border-[#00ff64]/25 bg-[#00ff64]/5 px-2.5 py-2 sm:px-3 shrink-0 w-full min-w-0 max-w-full basis-full sm:basis-auto md:max-w-md"
                style={{ clipPath: clip }}
            >
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[#00ff64]/80 text-[9px] font-bold tracking-[0.2em] uppercase">
                        Room code
                    </span>
                    <span
                        className="text-white font-mono font-bold text-[11px] sm:text-sm tracking-[0.12em] sm:tracking-[0.2em] break-all leading-snug"
                        title={roomCode}
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

            <div className="flex md:hidden w-full gap-2 justify-between border-t border-white/10 pt-3 order-last">
                {stats.map((stat) => (
                    <div key={stat.label} className="text-center flex-1 min-w-0 px-1">
                        <p className="text-white/25 text-[8px] tracking-[0.2em] uppercase truncate">{stat.label}</p>
                        <p
                            className="text-[#00ff64] font-black text-[11px] tracking-[0.12em] uppercase truncate"
                            style={{ fontFamily: "'Arial Black', sans-serif" }}
                        >
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div
                className={`grid gap-2 shrink-0 w-full md:flex md:flex-row md:flex-wrap md:w-auto md:justify-end md:gap-2 order-last ${
                    isHost ? "grid-cols-2" : "grid-cols-1"
                }`}
            >
                {isHost && (
                    <button
                        type="button"
                        onClick={onBackToLobby}
                        title="Move all agents back to the waiting area and reset the round in the database."
                        className="min-h-[42px] md:min-h-0 flex items-center justify-center border border-[#00ff64]/35 text-[#00ff64]/90 hover:bg-[#00ff64]/10 hover:border-[#00ff64]/60 text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.2em] uppercase px-2 sm:px-4 py-2.5 md:py-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                        style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                    >
                        <span className="md:hidden">To lobby</span>
                        <span className="hidden md:inline">Back to lobby</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={onLeaveRoom}
                    className="min-h-[42px] md:min-h-0 flex items-center justify-center border border-red-500/35 text-red-400/80 hover:text-red-300 hover:border-red-400/55 text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.2em] uppercase px-2 sm:px-4 py-2.5 md:py-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                >
                    <span className="md:hidden">Leave</span>
                    <span className="hidden md:inline">Leave room</span>
                </button>
            </div>
        </div>
    );
};

export default GameHeader;
