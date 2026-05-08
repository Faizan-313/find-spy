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

    const btnClip = "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))";
    const btnBase =
        "min-h-[44px] w-full sm:min-h-0 sm:w-auto flex items-center justify-center font-bold text-[10px] uppercase cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 px-4 py-3 sm:px-5 sm:py-2.5 tracking-[0.14em] sm:tracking-[0.22em]";

    return (
        <>
            <div
                className="flex flex-col gap-4 border border-white/10 bg-white/2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 w-full min-w-0 max-w-full"
                style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
                <div className="flex items-center gap-2 shrink-0 sm:pr-2">
                    <div className="h-px w-6 bg-[#00ff64]/25" />
                    <span className="text-white/35 text-[9px] tracking-[0.28em] uppercase font-semibold">
                        Host controls
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-end gap-2 w-full min-w-0 sm:w-auto sm:gap-3">
                    <button
                        type="button"
                        onClick={onStartVoting}
                        disabled={gameState !== "discussion"}
                        className={`${btnBase} bg-[#00ff64]/10 border border-[#00ff64]/35 text-[#00ff64] hover:bg-[#00ff64]/18`}
                        style={{ clipPath: btnClip }}
                    >
                        Start voting
                    </button>
                    <button
                        type="button"
                        onClick={onEndVoting}
                        disabled={gameState !== "voting"}
                        className={`${btnBase} border border-yellow-500/35 text-yellow-400/90 hover:text-yellow-300 hover:border-yellow-400/55 hover:bg-yellow-500/5`}
                        style={{ clipPath: btnClip }}
                    >
                        End voting
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowEndConfirm(true)}
                        disabled={gameState === "ended"}
                        className={`${btnBase} border border-red-500/40 text-red-400/90 hover:text-red-300 hover:border-red-400/60 hover:bg-red-500/10`}
                        style={{ clipPath: btnClip }}
                    >
                        End game
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
                            className="px-5 py-5 sm:px-7 sm:py-6 border-b max-h-[min(70vh,100%)] overflow-y-auto"
                            style={{ borderColor: `${accent}22` }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-8 shrink-0" style={{ backgroundColor: `${accent}80` }} />
                                <span
                                    className="text-[10px] font-bold tracking-[0.25em] uppercase"
                                    style={{ color: accent }}
                                >
                                    Confirm end mission
                                </span>
                            </div>
                            <h2
                                id="end-game-title"
                                className="text-xl sm:text-2xl font-black tracking-[0.08em] sm:tracking-[0.12em] uppercase text-white leading-tight"
                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                            >
                                End game for everyone?
                            </h2>
                            <p id="end-game-desc" className="text-white/45 text-[11px] sm:text-xs tracking-wide mt-3 leading-relaxed">
                                This ends the session for all agents in this room. They will see the game as finished. If you
                                only wanted a new round after results, close this and use <span className="text-white/70">Play Again</span> on the mission debrief instead.
                            </p>
                        </div>
                        <div className="px-5 py-4 sm:px-7 sm:py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 border-t border-white/8">
                            <button
                                type="button"
                                onClick={() => setShowEndConfirm(false)}
                                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto flex items-center justify-center border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-bold text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmEnd}
                                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto flex items-center justify-center border font-black text-[10px] tracking-[0.2em] sm:tracking-[0.28em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-[0.98] text-black bg-red-500/90 hover:bg-red-400 border-red-400/70"
                                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                            >
                                End for everyone
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HostControls;
