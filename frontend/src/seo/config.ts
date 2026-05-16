export const SITE_NAME = "Find the Spy";
export const SITE_TAGLINE = "Free multiplayer spy deduction game online";
export const DEFAULT_DESCRIPTION =
    "Play Find the Spy online with friends. Create a room, get secret words, chat, and vote to expose the spy. Free browser-based social deduction game for 2–8 players.";

export const SITE_URL =
    (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");

export type RouteSeoConfig = {
    title: string;
    description: string;
    path: string;
    index?: boolean;
};

export const PUBLIC_ROUTES: RouteSeoConfig[] = [
    {
        path: "/",
        title: "Find the Spy — Free Online Multiplayer Game",
        description: DEFAULT_DESCRIPTION,
    },
    {
        path: "/how-to-play",
        title: "How to Play Find the Spy — Rules & Guide",
        description:
            "Learn how to play Find the Spy: create or join a room, get secret words, discuss in chat, vote out the spy, and win as agents or the spy. Full rules for 2–8 players.",
    },
    {
        path: "/create-room",
        title: "Create a Game Room — Host Find the Spy",
        description:
            "Host a new Find the Spy game. Name your operation, pick an agent name, and invite friends with a room code. Start a free multiplayer spy game in seconds.",
    },
    {
        path: "/join-room",
        title: "Join a Game Room — Play Find the Spy",
        description:
            "Join a Find the Spy game with an invite code. Enter the room code from your host and your agent name to jump into a live multiplayer mission.",
    },
];

const PRIVATE_ROUTE_META: Record<string, Pick<RouteSeoConfig, "title" | "description">> = {
    "/room-waiting": {
        title: "Game Lobby",
        description: "Waiting room for your Find the Spy mission.",
    },
    "/room": {
        title: "Game Lobby",
        description: "Waiting room for your Find the Spy mission.",
    },
    "/game": {
        title: "Mission in Progress",
        description: "Active Find the Spy game session.",
    },
};

export function getRouteSeo(pathname: string): RouteSeoConfig {
    const publicRoute = PUBLIC_ROUTES.find((r) => r.path === pathname);
    if (publicRoute) return { ...publicRoute, index: true };

    const privateMeta = PRIVATE_ROUTE_META[pathname];
    if (privateMeta) {
        return {
            path: pathname,
            ...privateMeta,
            index: false,
        };
    }

    return {
        path: pathname,
        title: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        index: false,
    };
}
