import { Link, NavLink } from "react-router-dom";

type NavItem = {
    to: string;
    label: string;
    shortLabel: string;
    variant: "link" | "create" | "join";
};

const navItems: NavItem[] = [
    { to: "/", label: "Home", shortLabel: "Home", variant: "link" },
    { to: "/how-to-play", label: "How to Play", shortLabel: "Guide", variant: "link" },
    { to: "/create-room", label: "Create Room", shortLabel: "Create", variant: "create" },
    { to: "/join-room", label: "Join Room", shortLabel: "Join", variant: "join" },
];

function desktopLinkClass(isActive: boolean, variant: NavItem["variant"]) {
    const base =
        "inline-flex items-center justify-center font-semibold uppercase transition-colors duration-200";

    if (variant === "create") {
        return `${base} px-3.5 py-2 text-[11px] tracking-[0.14em] rounded-sm border ${
            isActive
                ? "bg-green-400 text-black border-green-400"
                : "text-green-400 border-green-500/35 bg-green-500/10 hover:bg-green-500/20"
        }`;
    }

    if (variant === "join") {
        return `${base} px-3.5 py-2 text-[11px] tracking-[0.14em] rounded-sm border ${
            isActive
                ? "bg-white text-black border-white"
                : "text-white/80 border-white/25 bg-white/5 hover:bg-white/10"
        }`;
    }

    return `${base} px-2 py-2 text-[11px] tracking-[0.16em] rounded-sm ${
        isActive ? "text-green-400" : "text-white/45 hover:text-white/85"
    }`;
}

function mobileLinkClass(isActive: boolean, variant: NavItem["variant"]) {
    const base =
        "flex h-10 w-full items-center justify-center rounded-sm text-[11px] font-semibold uppercase tracking-wide transition-colors";

    if (variant === "create") {
        return `${base} ${
            isActive ? "bg-green-400 text-black" : "bg-green-400/15 text-green-400"
        }`;
    }

    if (variant === "join") {
        return `${base} ${
            isActive ? "bg-white text-black" : "border border-white/20 text-white/75"
        }`;
    }

    return `${base} ${isActive ? "text-green-400 bg-green-500/10" : "text-white/50"}`;
}

const Navbar = () => {
    const mainItems = navItems.filter((item) => item.variant === "link");
    const actionItems = navItems.filter((item) => item.variant !== "link");

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
            <div className="mx-auto flex h-12 max-w-6xl items-center px-4 md:h-16 md:px-6 lg:px-8">
                <Link
                    to="/"
                    className="flex min-w-0 items-center gap-2 text-green-50 no-underline"
                >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                    <span className="font-bold text-sm uppercase tracking-[0.2em]">
                        Spy Game
                    </span>
                </Link>

                {/* Desktop links */}
                <nav
                    className="ml-auto hidden items-center gap-5 md:flex"
                    aria-label="Main navigation"
                >
                    <ul className="flex items-center gap-1">
                        {mainItems.map(({ to, label, variant }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) => desktopLinkClass(isActive, variant)}
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="h-4 w-px bg-white/15" aria-hidden />

                    <ul className="flex items-center gap-2">
                        {actionItems.map(({ to, label, variant }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) => desktopLinkClass(isActive, variant)}
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Mobile*/}
            <nav
                className="border-t border-white/10 px-3 pb-2 pt-2 md:hidden"
                aria-label="Main navigation"
            >
                <ul className="mx-auto grid max-w-6xl grid-cols-4 gap-1.5">
                    {navItems.map(({ to, shortLabel, variant }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) => mobileLinkClass(isActive, variant)}
                            >
                                {shortLabel}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
