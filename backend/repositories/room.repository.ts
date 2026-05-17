import type { Pool, PoolClient } from "pg";
import dbPool from "../database/db.config";
import type { dbRoom } from "../types/types";

type Queryable = Pool | PoolClient;

export async function findLatestRoomByHost(
    host: string,
    db: Queryable = dbPool
): Promise<{ id: string; is_ended: boolean } | null> {
    const result = await db.query<{ id: string; is_ended: boolean }>(
        "SELECT id, is_ended FROM room WHERE host = $1 ORDER BY created_at DESC LIMIT 1",
        [host]
    );
    return result.rows[0] ?? null;
}

export async function isRoomCodeTaken(code: string, db: Queryable = dbPool): Promise<boolean> {
    const result = await db.query("SELECT 1 FROM room WHERE room_code = $1 LIMIT 1", [code]);
    return result.rows.length > 0;
}

export async function insertRoom(
    name: string,
    host: string,
    roomCode: string,
    db: Queryable = dbPool
): Promise<string> {
    const result = await db.query<{ id: string }>(
        "INSERT INTO room (name, host, room_code) VALUES ($1, $2, $3) RETURNING id",
        [name, host, roomCode]
    );
    if (!result.rows.length) {
        throw new Error("Failed to create room");
    }
    return String(result.rows[0].id);
}

export async function findRoomByCode(
    roomCode: string,
    db: Queryable = dbPool
): Promise<dbRoom | null> {
    const result = await db.query<dbRoom>(
        "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
        [roomCode]
    );
    return result.rows[0] ?? null;
}

export async function findRoomById(
    roomId: string | number,
    db: Queryable = dbPool
): Promise<dbRoom | null> {
    const result = await db.query<dbRoom>("SELECT * FROM room WHERE id = $1 LIMIT 1", [roomId]);
    return result.rows[0] ?? null;
}
