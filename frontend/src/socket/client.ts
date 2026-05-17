import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** One shared connection for the session — avoids disconnect deleting DB rows on route changes. */
export function getSocket(): Socket {
    if (!socket) {
        socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
