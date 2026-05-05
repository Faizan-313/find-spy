import { useState } from "react";
import type { GameState } from "../../../types/types";

type HostControlsProps = {
    gameState: GameState;
    onStartVoting: () => void;
    onEndVoting: () => void;
    onEndGame: () => void;
};

const HostControls = ({
    gameState,
    onStartVoting,
    onEndVoting,
    onEndGame,
}: HostControlsProps) => {
    const [showEndConfirm, setShowEndConfirm] = useState(false);

    const accent = "#ff4444";

    const handleConfirmEnd = () => {
        setShowEndConfirm(false);
        onEndGame();
    };

    return (
        <>
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
                        type="button"
                        onClick={onStartVoting}
                        disabled={gameState !== "discussion"}
                        className="bg-[#00ff64]/10 border border-[#00ff64]/30 text-[#00ff64] font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 hover:bg-[#00ff64]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                    >
                        Start Voting
                    </button>
                    <button
                        type="button"
                        onClick={onEndVoting}
                        disabled={gameState !== "voting"}
                        className="border border-yellow-500/30 text-yellow-500/70 hover:text-yellow-400 hover:border-yellow-400/60 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                    >
                        End Voting
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowEndConfirm(true)}
                        disabled={gameState === "ended"}
                        className="border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-400/60 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                    >
                        End Game
                    </button>
                </div>
            </div>

            {showEndConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                    onClick={() => setShowEndConfirm(false)}
                >
                    <div
                        className="relative w-full max-w-md border bg-[#0a0a0a]"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-labelledby="end-game-title"
                        aria-describedby="end-game-desc"
                        style={{
                            borderColor: `${accent}55`,
                            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                            boxShadow: `0 0 60px ${accent}22`,
                        }}
                    >
                        <div
                            className="px-7 py-6 border-b"
                            style={{ borderColor: `${accent}22` }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-8" style={{ backgroundColor: `${accent}80` }} />
                                <span
                                    className="text-[10px] font-bold tracking-[0.3em] uppercase"
                                    style={{ color: accent }}
                                >
                                    Confirm End Mission
                                </span>
                            </div>
                            <h2
                                id="end-game-title"
                                className="text-2xl font-black tracking-[0.12em] uppercase text-white"
                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                            >
                                End game for everyone?
                            </h2>
                            <p id="end-game-desc" className="text-white/45 text-xs tracking-wider mt-3 leading-relaxed">
                                This ends the session for all agents in this room. They will see the game as finished. If you
                                only wanted a new round after results, close this and use <span className="text-white/70">Play Again</span> on the mission debrief instead.
                            </p>
                        </div>
                        <div className="px-7 py-5 flex justify-end gap-3 border-t border-white/8">
                            <button
                                type="button"
                                onClick={() => setShowEndConfirm(false)}
                                className="border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95"
                                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmEnd}
                                className="border font-black text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95 text-black bg-red-500/90 hover:bg-red-400 border-red-400/70"
                                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                            >
                                Yes, End Game
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HostControls;
