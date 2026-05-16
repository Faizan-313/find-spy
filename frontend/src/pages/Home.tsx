import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="relative w-full min-h-[100dvh] overflow-x-hidden bg-black">

            <img
                src="homepage-bg.png"
                alt="Dark tactical background for Find the Spy multiplayer game"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.3] saturate-50"
                fetchPriority="high"
            />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] text-center px-5 pt-24 pb-28 sm:pt-16 sm:pb-16">

                <h1 className="sr-only">Find the Spy — free online multiplayer social deduction game</h1>

                <p className="text-green-400 text-[0.65rem] sm:text-[0.7rem] font-semibold tracking-[4px] sm:tracking-[5px] uppercase mb-4 sm:mb-5 animate-fade-in">
                    — classified operation —
                </p>

                <p className="text-white/40 text-xs sm:text-sm font-medium tracking-[2px] max-w-sm leading-relaxed mb-8 sm:mb-12 px-2">
                    Blend in. Root out the spy. Trust no one. Play free in your browser with 2–8 players.
                </p>
                
                <div className="grow min-h-[4rem] sm:min-h-[6rem] max-h-28 sm:max-h-40 w-full" aria-hidden />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none justify-center items-stretch sm:items-center">
                    <Link
                        to="/create-room"
                        className="group flex flex-col items-center justify-center gap-1 px-6 sm:px-8 py-4 sm:py-3.5 bg-green-400 text-black rounded-sm hover:bg-green-300 transition-all duration-200 hover:-translate-y-px text-center shadow-[0_0_28px_rgba(74,222,128,0.3)] border-2 border-green-400"
                    >
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase opacity-70">
                            Host a game
                        </span>
                        <span className="text-[11px] sm:text-xs font-black tracking-[2px] sm:tracking-[2.5px] uppercase">
                            Create Room
                        </span>
                    </Link>
                    <Link
                        to="/join-room"
                        className="group flex flex-col items-center justify-center gap-1 px-6 sm:px-8 py-4 sm:py-3.5 bg-transparent text-white rounded-sm border-2 border-dashed border-white/40 hover:border-white hover:bg-white/5 transition-all duration-200 text-center"
                    >
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/45 group-hover:text-white/70">
                            Have a code?
                        </span>
                        <span className="text-[11px] sm:text-xs font-black tracking-[2px] sm:tracking-[2.5px] uppercase">
                            Join Room
                        </span>
                    </Link>
                    <Link
                        to="/how-to-play"
                        className="sm:hidden px-6 py-3 text-white/45 text-[10px] font-bold tracking-[2px] uppercase rounded-sm border border-dashed border-white/20 hover:border-green-500/40 hover:text-green-400 hover:bg-green-500/5 transition-all duration-200 text-center"
                    >
                        How to Play
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;