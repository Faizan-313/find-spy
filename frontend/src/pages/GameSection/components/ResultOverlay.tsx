import type { ResultOverlayProps } from "../../../types/types";


const ResultOverlay = ({ result, didWin, userName, isHost, onReplay, onClose }: ResultOverlayProps) => {
    const headline = didWin ? "You Won" : "You Lost";
    const accent = didWin ? "#00ff64" : "#ff4444";
    const subline =
        result.winnerType === "Agents"
            ? result.votedOut
                ? `Agents exposed ${result.votedOut.name} — the spy.`
                : "Agents win!"
            : result.tie
            ? "The vote was tied. The spy escaped."
            : result.votedOut
            ? `${result.votedOut.name} was wrongly accused. The spy escaped.`
            : "Nobody was voted out. The spy escaped.";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl border bg-[#0a0a0a]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    borderColor: `${accent}55`,
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                    boxShadow: `0 0 80px ${accent}33`,
                }}
            >
                <div
                    className="px-8 py-7 border-b"
                    style={{ borderColor: `${accent}22` }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-px w-8" style={{ backgroundColor: `${accent}80` }} />
                        <span
                            className="text-[10px] font-bold tracking-[0.3em] uppercase"
                            style={{ color: accent }}
                        >
                            Mission Debrief
                        </span>
                    </div>
                    <h2
                        className="text-6xl font-black tracking-[0.15em] uppercase leading-none"
                        style={{
                            color: accent,
                            fontFamily: "'Arial Black', sans-serif",
                            textShadow: `0 0 40px ${accent}55`,
                        }}
                    >
                        {headline}
                    </h2>
                    <p className="text-white/50 text-sm tracking-[0.2em] uppercase mt-3">
                        {result.winnerType === "Agents" ? "Agents win" : "Spy wins"}
                    </p>
                    <p className="text-white/40 text-xs tracking-wider mt-2">{subline}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div
                        className="px-8 py-6 border-b md:border-b-0 md:border-r"
                        style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    >
                        <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
                            Spy Revealed
                        </p>
                        {result.spy ? (
                            <div className="flex flex-col gap-1">
                                <span
                                    className="text-white text-lg font-black tracking-[0.2em] uppercase"
                                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                                >
                                    {result.spy.name}
                                    {result.spy.name === userName && (
                                        <span className="text-[#00ff64] text-[9px] tracking-widest uppercase border border-[#00ff64]/40 px-1.5 py-0.5 ml-2">
                                            You
                                        </span>
                                    )}
                                </span>
                                {result.spy.word && (
                                    <span className="text-white/40 text-xs tracking-wider">
                                        Word: <span className="text-[#1ec6af] font-bold">"{result.spy.word}"</span>
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-white/30 text-xs">Unknown</span>
                        )}
                    </div>

                    <div className="px-8 py-6">
                        <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
                            Vote Tally
                        </p>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {result.voteCounts.map(({ player, count }) => (
                                <div key={player.id} className="flex items-center justify-between gap-3">
                                    <span
                                        className="text-white/70 text-xs font-black tracking-[0.15em] uppercase truncate"
                                        style={{ fontFamily: "'Arial Black', sans-serif" }}
                                    >
                                        {player.name}
                                        {player.isSpy && (
                                            <span className="text-red-400 text-[8px] tracking-widest uppercase border border-red-400/40 px-1 py-0.5 ml-2">
                                                Spy
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[#00ff64] text-xs font-black tracking-widest">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className="px-8 py-6 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
                        Winners
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {result.winners.length === 0 ? (
                            <span className="text-white/30 text-xs">None</span>
                        ) : (
                            result.winners.map((w) => (
                                <span
                                    key={w.id}
                                    className="text-white text-xs font-black tracking-[0.15em] uppercase border px-3 py-1.5 flex items-center gap-2"
                                    style={{
                                        fontFamily: "'Arial Black', sans-serif",
                                        borderColor: `${accent}66`,
                                        background: `${accent}14`,
                                        clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
                                    />
                                    {w.name}
                                    {w.name === userName && (
                                        <span className="text-[8px] tracking-widest uppercase opacity-70">· You</span>
                                    )}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="px-8 py-5 flex items-center justify-between gap-3 border-t border-white/5">
                    <span className="text-white/30 text-[9px] tracking-[0.25em] uppercase">
                        {isHost
                            ? "Start a fresh round with new words"
                            : "Waiting for host to start a new round..."}
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 active:scale-95"
                            style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                        >
                            Close
                        </button>
                        {isHost && (
                            <button
                                onClick={onReplay}
                                className="bg-[#00ff64] text-black font-black text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 hover:bg-white active:scale-95"
                                style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                            >
                                Play Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultOverlay;