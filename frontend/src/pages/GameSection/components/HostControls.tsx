import type { GameState } from "../../../types/types";

type HostControlsProps = {
    gameState: GameState;
    onStartVoting: () => void;
    onEndVoting: () => void;
    onEndGame: () => void;
    onRestartGame: () => void;
};

const HostControls = ({
    gameState,
    onStartVoting,
    onEndVoting,
    onEndGame,
    onRestartGame,
}: HostControlsProps) => {
    return (
        <div
            className="flex items-center justify-between border border-white/10 bg-white/2 px-6 py-4"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
            <div className="flex items-center gap-2">
                <div className="h-px w-6 bg-white/10" />
                <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase">Host Controls</span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onStartVoting}
                    disabled={gameState !== "discussion"}
                    className="bg-[#00ff64]/10 border border-[#00ff64]/30 text-[#00ff64] font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 hover:bg-[#00ff64]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                >
                    Start Voting
                </button>
                <button
                    onClick={onEndVoting}
                    disabled={gameState !== "voting"}
                    className="border border-yellow-500/30 text-yellow-500/70 hover:text-yellow-400 hover:border-yellow-400/60 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                >
                    End Voting
                </button>
                <button
                    onClick={onEndGame}
                    disabled={gameState === "ended"}
                    className="border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-400/60 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                >
                    End Game
                </button>
                <button
                    onClick={onRestartGame}
                    className="bg-[#00ff64] text-black font-black text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 hover:bg-white active:scale-95"
                    style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default HostControls;
