import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">

            <img
                src="homepage-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover brightness-[0.3] saturate-50"
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-16">

                <p className="text-green-400 text-[0.7rem] font-semibold tracking-[5px] uppercase mb-5 animate-fade-in">
                    — classified operation —
                </p>

                <p className="text-white/40 text-sm font-medium tracking-[2px] max-w-sm leading-relaxed mb-12">
                    Blend in. Root out the spy. Trust no one.
                </p>
                
                <div className="h-60"></div>

                <div className="flex gap-4 flex-wrap justify-center">
                    <Link
                        to="/create-room"
                        className="px-8 py-3 bg-green-400 text-black text-xs font-bold tracking-[2.5px] uppercase rounded-sm hover:bg-green-300 transition-all duration-200 hover:-translate-y-px"
                    >
                        Create Room
                    </Link>
                    <Link
                        to="/join-room"
                        className="px-8 py-3 bg-transparent text-white/60 text-xs font-bold tracking-[2.5px] uppercase rounded-sm border border-white/20 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 transition-all duration-200"
                    >
                        Join Room
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;