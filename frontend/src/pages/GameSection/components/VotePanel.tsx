import type { VotePanelProps } from "../../../types/types";
import { formatTime } from "../../../utils/utils";



const VotePanel = ({
    players,
    currentPlayerId,
    gameState,
    isVotingPhase,
    votingTimer,
    selectedVote,
    hasSubmittedVote,
    voteCountByPlayerId,
    onSelect,
    onSubmit,
}: VotePanelProps) => {
    const me = String(currentPlayerId ?? "");

    return (
        <div
            className="border border-white/10 bg-white/2"
            style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
        >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.25em] uppercase flex items-center gap-2">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#00ff64]" />
                    Vote to Expose
                </p>
                {isVotingPhase ? (
                    <span
                        className={`text-[9px] tracking-widest uppercase font-bold ${
                            votingTimer <= 30 ? "text-red-500" : "text-yellow-500"
                        }`}
                    >
                        {formatTime(votingTimer)}
                    </span>
                ) : (
                    <span className="text-white/20 text-[9px] tracking-widest uppercase">
                        {gameState === "ended" ? "Game ended" : "Waiting for voting"}
                    </span>
                )}
            </div>

            <div className="px-5 py-4 grid grid-cols-2 gap-3">
                {players.map((player) => {
                    const playerId = String(player.id);
                    const isSelf = playerId === me;
                    const disabled = !isVotingPhase || isSelf || hasSubmittedVote;
                    const voteCount = voteCountByPlayerId.get(playerId) ?? 0;
                    const selected = selectedVote === playerId;

                    return (
                        <label
                            key={playerId}
                            className={`flex items-center gap-3 border px-4 py-3 transition-all duration-150 group ${
                                disabled
                                    ? "opacity-50 cursor-not-allowed border-white/10 bg-white/2"
                                    : selected
                                    ? "cursor-pointer border-[#00ff64]/70 bg-[#00ff64]/10 shadow-[0_0_20px_rgba(0,255,100,0.15)]"
                                    : "cursor-pointer border-white/10 bg-white/2 hover:border-[#00ff64]/40 hover:bg-[#00ff64]/5"
                            }`}
                            style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                        >
                            <input
                                type="radio"
                                name="vote"
                                value={playerId}
                                checked={selected}
                                onChange={(e) => onSelect(e.target.value)}
                                disabled={disabled}
                                className="sr-only"
                            />
                            <span
                                aria-hidden
                                className={`relative w-4 h-4 rounded-full border-2 transition-all duration-150 shrink-0 flex items-center justify-center ${
                                    selected
                                        ? "border-[#00ff64] bg-[#00ff64]/15 shadow-[0_0_10px_rgba(0,255,100,0.6)]"
                                        : "border-white/30 group-hover:border-[#00ff64]/60"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full bg-[#00ff64] transition-all duration-150 ${
                                        selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                    }`}
                                />
                            </span>
                            <span
                                className={`font-black text-xs tracking-[0.15em] uppercase transition-colors duration-150 flex-1 truncate ${
                                    selected ? "text-[#00ff64]" : "text-white/70 group-hover:text-white"
                                }`}
                                style={{ fontFamily: "'Arial Black', sans-serif" }}
                            >
                                {player.name}
                                {isSelf && (
                                    <span className="text-white/30 text-[8px] ml-2">(you)</span>
                                )}
                            </span>
                            {voteCount > 0 && (
                                <span className="text-[#00ff64] text-[10px] font-black tracking-widest">
                                    {voteCount}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>

            {isVotingPhase && (
                <div className="px-5 pb-4 flex justify-end">
                    <button
                        onClick={onSubmit}
                        disabled={!selectedVote || hasSubmittedVote}
                        className="bg-[#00ff64]/10 border border-[#00ff64]/30 text-[#00ff64] font-bold text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 cursor-pointer transition-all duration-200 hover:bg-[#00ff64]/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))" }}
                    >
                        {hasSubmittedVote ? "Vote Submitted" : "Submit Vote"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default VotePanel;
