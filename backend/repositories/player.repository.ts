import type { Pool, PoolClient } from "pg";
import dbPool from "../database/db.config";

type Queryable = Pool | PoolClient;

export async function insertPlayer(
    name: string,
    isHost: boolean,
    roomId: string,
    db: Queryable = dbPool
): Promise<string> {
    const result = await db.query<{ id: string }>(
        "INSERT INTO player (name, is_host, room_id) VALUES ($1, $2, $3) RETURNING id",
        [name, isHost, roomId]
    );
    if (!result.rows.length) {
        throw new Error("Failed to create player");
    }
    return String(result.rows[0].id);
}

export async function findPlayerByNameAndRoom(
    roomId: string | number,
    name: string,
    db: Queryable = dbPool
): Promise<{ id: string } | null> {
    const result = await db.query<{ id: string }>(
        "SELECT id FROM player WHERE room_id = $1 AND name = $2 LIMIT 1",
        [roomId, name]
    );
    return result.rows[0] ?? null;
}

export async function countPlayersInRoom(
    roomId: string | number,
    db: Queryable = dbPool
): Promise<number> {
    const result = await db.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM player WHERE room_id = $1",
        [roomId]
    );
    return parseInt(result.rows[0]?.count ?? "0", 10);
}
