import type { dbRoom } from "../../types/types";
import dbPool from "../../database/db.config";
import { Server } from "socket.io";
import fetchRoomState from "./fetchRoomState"

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

    // Host leaving: mark room ended, remove all players, and evict all sockets
    if (room.host === username) {
        await dbPool.query(
            "UPDATE room SET is_ended = TRUE, is_started = FALSE, is_voting_started = FALSE WHERE id = $1",
            [room.id]
        );
        await dbPool.query("DELETE FROM vote WHERE room_id = $1", [room.id]);
        await dbPool.query("DELETE FROM player WHERE room_id = $1", [room.id]);
        io.to(roomCode).emit("roomEnded", { message: "The host has left. The room has been closed." });

        // Clear socket data for every socket currently in the room and evict them.
        const sockets = await io.in(roomCode).fetchSockets();
        for (const s of sockets) {
            s.data.username = undefined;
            s.data.roomCode = undefined;
            s.leave(roomCode);
        }
    } else {
        // Regular player remove from DB and notify remaining players
        await dbPool.query(
            "DELETE FROM vote WHERE room_id = $1 AND voter_id IN (SELECT id FROM player WHERE name = $2 AND room_id = $1)",
            [room.id, username]
        );
        await dbPool.query(
            "DELETE FROM player WHERE name = $1 AND room_id = $2",
            [username, room.id]
        );
        socket.leave(roomCode);

        const updatedRoom = await fetchRoomState(room.id);
        io.to(roomCode).emit("roomUpdated", updatedRoom);
    }
}

// Tracks users who disconnected but may be navigating between pages.
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

export { handlePlayerLeave, cancelPendingLeave, pendingLeaves, pendingLeaveKey };