import type { HistoryEntry } from "../../../types/types";

type GameHistoryProps = {
    history: HistoryEntry[];
};

const timeColor = (type: HistoryEntry["type"]) => {
    switch (type) {
        case "system":
            return "text-[#00ff64]/60";
        case "phase":
            return "text-yellow-500/60";
        case "leave":
            return "text-red-400/60";
        default:
            return "text-white/25";
    }
};

const GameHistory = ({ history }: GameHistoryProps) => {
    return (
        <div
            className="border border-white/10 bg-white/2 flex-1"
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
        >
            <div className="px-5 py-3 border-b border-white/6">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                    Game History
                </p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="text-white/30 text-xs">No history yet</div>
                ) : (
                    history.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className={`text-[9px] tracking-widest shrink-0 mt-0.5 ${timeColor(entry.type)}`}>
                                {entry.time}
                            </span>
                            <span className="text-white/40 text-[10px] tracking-wide">{entry.event}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GameHistory;
