import type { Player } from "../../../types/types";
import { getAvatarColor } from "../../../utils/utils";

type PlayerListProps = {
    players: Player[];
    userName: string;
    isVotingPhase: boolean;
    voteCountByPlayerId: Map<string, number>;
};

const PlayerList = ({
    players,
    userName,
    isVotingPhase,
    voteCountByPlayerId,
}: PlayerListProps) => {
    return (
        <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                    Active Agents
                </p>
                <span className="text-white/20 text-[9px] tracking-widest uppercase">
                    {players.length} online
                </span>
            </div>

            {players.map((player, index) => {
                const voteCount = voteCountByPlayerId.get(String(player.id)) ?? 0;
                return (
                    <div
                        key={player.id}
                        className="flex items-center gap-3 border border-white/10 bg-white/2 px-4 py-3 transition-all duration-200 hover:border-white/20 hover:bg-white/4"
                        style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
                    >
                        <div
                            className="w-10 h-10 shrink-0 flex items-center justify-center font-black text-sm relative"
                            style={{
                                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                                background: `linear-gradient(135deg, ${getAvatarColor(index).from}, ${getAvatarColor(index).to})`,
                                fontFamily: "'Arial Black', sans-serif",
                            }}
                        >
                            <span className="text-black text-xs tracking-wide">
                                {player.name.slice(0, 2).toUpperCase()}
                            </span>

                            {player.isHost && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff64] rounded-full shadow-[0_0_6px_rgba(0,255,100,0.8)]" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="text-white font-black text-xs tracking-[0.15em] uppercase truncate"
                                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                                >
                                    {player.name}
                                </span>
                                {player.name === userName && (
                                    <span className="text-[#00ff64] text-[8px] tracking-widest uppercase border border-[#00ff64]/30 px-1 py-0.5 leading-none shrink-0">
                                        You
                                    </span>
                                )}
                            </div>
                            <span className="text-white/20 text-[9px] tracking-widest uppercase mt-0.5">
                                {player.isHost ? "Commander" : `Agent ${String(index + 1).padStart(2, "0")}`}
                            </span>
                        </div>

                        {isVotingPhase && voteCount > 0 && (
                            <span
                                className="text-[#00ff64] text-[10px] font-black tracking-widest border border-[#00ff64]/40 px-1.5 py-0.5 shrink-0"
                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                                title={`${voteCount} vote${voteCount === 1 ? "" : "s"}`}
                            >
                                {voteCount}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PlayerList;
