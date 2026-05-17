import type { dbRoom } from "../../types/types";
import dbPool from "../../database/db.config";
import { Server } from "socket.io";
import fetchRoomState from "./fetchRoomState";

export const DISCONNECT_LEAVE_GRACE_MS = 5000;

const pendingLeaves = new Map<string, NodeJS.Timeout>();

const pendingLeaveKey = (username: string, roomCode: string) => `${username}::${roomCode}`;

const cancelPendingLeave = (username: string, roomCode: string) => {
    const key = pendingLeaveKey(username, roomCode);
    const timer = pendingLeaves.get(key);
    if (timer) {
        clearTimeout(timer);
        pendingLeaves.delete(key);
    }
};

/** Clear socket session state without deleting DB rows (room already finished). */
export async function detachSocketsFromRoom(io: Server, roomCode: string): Promise<void> {
    const sockets = await io.in(roomCode).fetchSockets();
    for (const s of sockets) {
        const u = s.data.username as string | undefined;
        const rc = s.data.roomCode as string | undefined;
        if (u && rc) {
            cancelPendingLeave(u, rc);
        }
        s.data.username = undefined;
        s.data.roomCode = undefined;
        s.leave(roomCode);
    }
}

async function handlePlayerLeave(
    socket: any,
    io: Server,
    roomCode: string,
    username: string
): Promise<void> {
    const roomResult = await dbPool.query<dbRoom>(
        "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
        [roomCode]
    );
    if (!roomResult.rows.length) return;

    const room = roomResult.rows[0];

    // Room was ended via "End game" — keep player rows for history / winners; only disconnect sockets.
    if (room.is_ended) {
        cancelPendingLeave(username, roomCode);
        socket.data.username = undefined;
        socket.data.roomCode = undefined;
        socket.leave(roomCode);
        return;
    }

    // Host leaving an active room: mark ended, remove players, evict sockets
    if (room.host === username) {
        await dbPool.query(
            "UPDATE room SET is_ended = TRUE, is_started = FALSE, is_voting_started = FALSE WHERE id = $1",
            [room.id]
        );
        io.to(roomCode).emit("roomEnded", { message: "The host has left. The room has been closed." });
        await detachSocketsFromRoom(io, roomCode);
    } else {
        socket.leave(roomCode);
        socket.data.username = undefined;
        socket.data.roomCode = undefined;

        let updatedRoom = await fetchRoomState(room.id);

        const midGame = room.is_started || room.is_voting_started;
        const onlyHostRemains =
            midGame &&
            updatedRoom !== null &&
            updatedRoom.players.length === 1;

        if (onlyHostRemains) {
            await dbPool.query(
                "UPDATE room SET is_started = FALSE, is_voting_started = FALSE, is_ended = FALSE WHERE id = $1",
                [room.id]
            );
            await dbPool.query("DELETE FROM vote WHERE room_id = $1", [room.id]);
            await dbPool.query(
                "UPDATE player SET is_spy = FALSE, word = NULL WHERE room_id = $1",
                [room.id]
            );
            updatedRoom = await fetchRoomState(room.id);
            if (updatedRoom) {
                io.to(roomCode).emit("returnedToLobby", {
                    message: `${username} has left. The mission cannot continue with one agent — returning to the waiting area.`,
                    room: updatedRoom,
                });
            }
        } else if (updatedRoom) {
            io.to(roomCode).emit("roomUpdated", updatedRoom);
        }
    }
}

export { handlePlayerLeave, cancelPendingLeave, pendingLeaves, pendingLeaveKey };
