import dbPool from "../database/db.config";
import generateRoomCode from "../socket/helpers/generateRoomCode";
import fetchRoomState from "../socket/helpers/fetchRoomState";
import * as roomRepo from "../repositories/room.repository";
import * as playerRepo from "../repositories/player.repository";

export class RoomServiceError extends Error {
    constructor(
        message: string,
        readonly code: "HOST_HAS_ROOM" | "NO_CODE" | "ROOM_NOT_FOUND" | "GAME_ENDED" | "GAME_STARTED" | "ROOM_FULL"
    ) {
        super(message);
        this.name = "RoomServiceError";
    }
}

export async function createRoomWithHost(roomName: string, username: string) {
    const existing = await roomRepo.findLatestRoomByHost(username);
    if (existing && !existing.is_ended) {
        throw new RoomServiceError(
            "You are already hosting a live room. Please end that room before creating a new one.",
            "HOST_HAS_ROOM"
        );
    }

    let roomCode: string | null = null;
    for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = generateRoomCode();
        if (!(await roomRepo.isRoomCodeTaken(candidate))) {
            roomCode = candidate;
            break;
        }
    }
    if (!roomCode) {
        throw new RoomServiceError(
            "Could not allocate a unique room code. Please try again.",
            "NO_CODE"
        );
    }

    const client = await dbPool.connect();
    try {
        await client.query("BEGIN");

        const roomId = await roomRepo.insertRoom(roomName, username, roomCode, client);
        await playerRepo.insertPlayer(username, true, roomId, client);

        await client.query("COMMIT");

        const state = await fetchRoomState(roomId);
        if (!state) {
            throw new Error("Room created but state could not be loaded");
        }
        return state;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function joinRoomByCode(roomCode: string, username: string) {
    const room = await roomRepo.findRoomByCode(roomCode);
    if (!room) {
        throw new RoomServiceError("Room not found", "ROOM_NOT_FOUND");
    }
    if (room.is_ended) {
        throw new RoomServiceError("Game has already ended", "GAME_ENDED");
    }

    const existing = await playerRepo.findPlayerByNameAndRoom(room.id, username);
    if (existing) {
        const state = await fetchRoomState(room.id);
        if (!state) {
            throw new Error("Failed to load room state");
        }
        return { state, rejoined: true as const };
    }

    if (room.is_started) {
        throw new RoomServiceError("Game has already started please wait!", "GAME_STARTED");
    }

    const count = await playerRepo.countPlayersInRoom(room.id);
    if (count >= 8) {
        throw new RoomServiceError("Room is full", "ROOM_FULL");
    }

    await playerRepo.insertPlayer(username, false, String(room.id));

    const state = await fetchRoomState(room.id);
    if (!state) {
        throw new Error("Failed to load room state after join");
    }
    return { state, rejoined: false as const };
}
