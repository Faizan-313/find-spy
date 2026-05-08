import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="relative w-full min-h-[100dvh] overflow-x-hidden bg-black">

            <img
                src="homepage-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover brightness-[0.3] saturate-50"
            />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] text-center px-5 pt-24 pb-28 sm:pt-16 sm:pb-16">

                <p className="text-green-400 text-[0.65rem] sm:text-[0.7rem] font-semibold tracking-[4px] sm:tracking-[5px] uppercase mb-4 sm:mb-5 animate-fade-in">
                    — classified operation —
                </p>

                <p className="text-white/40 text-xs sm:text-sm font-medium tracking-[2px] max-w-sm leading-relaxed mb-8 sm:mb-12 px-2">
                    Blend in. Root out the spy. Trust no one.
                </p>
                
                <div className="grow min-h-[4rem] sm:min-h-[6rem] max-h-28 sm:max-h-40 w-full" aria-hidden />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none justify-center items-stretch sm:items-center">
                    <Link
                        to="/create-room"
                        className="px-6 sm:px-8 py-3 bg-green-400 text-black text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[2.5px] uppercase rounded-sm hover:bg-green-300 transition-all duration-200 hover:-translate-y-px text-center"
                    >
                        Create Room
                    </Link>
                    <Link
                        to="/join-room"
                        className="px-6 sm:px-8 py-3 bg-transparent text-white/60 text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[2.5px] uppercase rounded-sm border border-white/20 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 transition-all duration-200 text-center"
                    >
                        Join Room
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;