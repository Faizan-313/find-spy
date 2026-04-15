import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="relative top-0 left-0 right-0 z-50 flex justify-between items-center px-10 h-16 bg-black/80 backdrop-blur-md border-b border-green-500/20">      
            <span className="font-black text-2xl tracking-[6px] uppercase text-green-50 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                Spy Game
            </span>
    =
            <div className="flex items-center gap-1">
                {[
                    { to: "/", label: "Home" },
                    { to: "/create-room", label: "Create Room" },
                    { to: "/join-room", label: "Join Room" },
                ].map(({ to, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                    `px-4 py-1.5 text-xs font-semibold tracking-[2px] uppercase rounded-sm border transition-all duration-200 ${
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