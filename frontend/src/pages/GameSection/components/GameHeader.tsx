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
};

const GameHeader = ({
    roomName,
    word,
    isSpy,
    gameState,
    isVotingPhase,
    votingTimer,
    onLeaveRoom,
}: GameHeaderProps) => {
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

    return (
        <div
            className="flex items-center justify-between border border-white/10 bg-white/2 px-6 py-4"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff64] shadow-[0_0_8px_rgba(0,255,100,0.8)] animate-pulse" />
                <div>
                    <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">Room Name</p>
                    <p
                        className="text-white font-black text-lg tracking-[0.2em] uppercase leading-none"
                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                    >
                        {roomName}
                    </p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
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

            <div className="flex flex-col justify-center items-center">
                <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase">Your Word</p>
                <p className="text-[#1ec6af] font-black text-sm tracking-[0.15em] uppercase">
                    "{word || "Waiting..."}"
                </p>
            </div>

            <button
                onClick={onLeaveRoom}
                className="border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-400/60 text-[10px] tracking-[0.25em] uppercase px-4 py-2 cursor-pointer transition-all duration-200 active:scale-95"
                style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
            >
                Leave Room
            </button>
        </div>
    );
};

export default GameHeader;
