import type { GameResultPayload } from "../../../types/types";

type WinnersPanelProps = {
    result: GameResultPayload;
    userName: string;
};

const WinnersPanel = ({ result, userName }: WinnersPanelProps) => {
    return (
        <div
            className="border border-[#00ff64]/30 bg-[#00ff64]/5"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
        >
            <div className="px-5 py-3 border-b border-[#00ff64]/20 flex items-center justify-between">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64] animate-pulse" />
                    Winners
                </p>
                <span
                    className="text-[#00ff64] text-[9px] tracking-widest uppercase border border-[#00ff64]/40 px-1.5 py-0.5"
                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                    {result.winnerType}
                </span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
                {result.winners.length === 0 ? (
                    <span className="text-white/30 text-xs">No winners</span>
                ) : (
                    result.winners.map((w) => (
                        <div
                            key={w.id}
                            className="flex items-center gap-2 border border-[#00ff64]/15 bg-[#00ff64]/5 px-3 py-2"
                            style={{ clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff64] shadow-[0_0_6px_rgba(0,255,100,0.8)]" />
                            <span
                                className="text-white text-xs font-black tracking-[0.15em] uppercase truncate"
                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                            >
                                {w.name}
                            </span>
                            {w.name === userName && (
                                <span className="ml-auto text-[#00ff64] text-[8px] tracking-widest uppercase border border-[#00ff64]/30 px-1 py-0.5">
                                    You
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WinnersPanel;
