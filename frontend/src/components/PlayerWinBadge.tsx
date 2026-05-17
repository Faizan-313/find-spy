type PlayerWinBadgeProps = {
    wins: number;
    className?: string;
};

const PlayerWinBadge = ({ wins, className = "" }: PlayerWinBadgeProps) => (
    <span
        className={`text-[9px] font-bold tracking-widest uppercase border px-1.5 py-0.5 leading-none shrink-0 ${
            wins > 0
                ? "text-yellow-400/90 border-yellow-500/35 bg-yellow-500/10"
                : "text-white/25 border-white/10 bg-white/5"
        } ${className}`}
        title={`${wins} mission win${wins === 1 ? "" : "s"} in this room`}
    >
        {wins}W
    </span>
);

export default PlayerWinBadge;
