import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="relative top-0 left-0 right-0 z-50 flex flex-wrap justify-between items-center gap-y-2 px-3 sm:px-6 lg:px-10 min-h-14 py-2 sm:py-0 sm:h-16 bg-black/80 backdrop-blur-md border-b border-green-500/20">
            <span className="font-black text-base sm:text-xl lg:text-2xl tracking-[0.2em] sm:tracking-[4px] lg:tracking-[6px] uppercase text-green-50 flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                <span className="truncate max-w-[42vw] sm:max-w-none">Spy Game</span>
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 w-full sm:w-auto justify-between sm:justify-end">
                {[
                    { to: "/", label: "Home" },
                    { to: "/create-room", label: <>Create<span className="hidden sm:inline"> Room</span></> },
                    { to: "/join-room", label: <>Join<span className="hidden sm:inline"> Room</span></> },
                ].map(({ to, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                    `px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-semibold tracking-[1.5px] sm:tracking-[2px] uppercase rounded-sm border transition-all duration-200 whitespace-nowrap ${
                        isActive
                        ? "text-green-400 border-green-500/50 bg-green-500/10"
                        : "text-white/40 border-transparent hover:text-white/80 hover:border-green-500/25 hover:bg-green-500/5"
                    }`}
                >
                    {label}
                </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;