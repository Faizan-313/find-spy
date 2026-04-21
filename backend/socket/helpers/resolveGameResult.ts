import dbPool from "../../database/db.config";
import type { Player } from "../../types/types";

export type WinnerType = "Spy" | "Agents";

export interface GameResult {
    winnerType: WinnerType;
    spy: Player | null;
    votedOut: Player | null;
    tie: boolean;
    winners: Player[];
    voteCounts: { player: Player; count: number }[];
}

/**
 * Rules:
 * - Players with the most votes are the "accused".
 * - If exactly one player is the accused AND that player is the spy -> Agents win.
 * - Otherwise (tie, nobody voted, wrong accusation) -> Spy wins.
 */

const resolveGameResult = async (roomId: string | number): Promise<GameResult> => {
    const playersResult = await dbPool.query<{
        id: string;
        name: string;
        is_host: boolean;
        is_spy: boolean;
        word: string | null;
    }>(
        "SELECT id, name, is_host, is_spy, word FROM player WHERE room_id = $1",
        [roomId]
    );

    const players: Player[] = playersResult.rows.map((p) => ({
        id: String(p.id),
        name: p.name,
        isHost: p.is_host,
        isSpy: p.is_spy,
        word: p.word ?? undefined,
    }));

    const spy = players.find((p) => p.isSpy) ?? null;

    const voteResult = await dbPool.query<{ votee_id: string; count: string }>(
        `SELECT votee_id, COUNT(*) AS count
         FROM vote
         WHERE room_id = $1
         GROUP BY votee_id`,
        [roomId]
    );

    const countByPlayerId = new Map<string, number>();
    for (const row of voteResult.rows) {
        countByPlayerId.set(String(row.votee_id), parseInt(row.count, 10));
    }

    const voteCounts = players
        .map((player) => ({ player, count: countByPlayerId.get(player.id) ?? 0 }))
        .sort((a, b) => b.count - a.count);

    const maxVotes = voteCounts[0]?.count ?? 0;
    const topVoted = voteCounts.filter((v) => v.count === maxVotes && maxVotes > 0);

    const tie = topVoted.length > 1;
    const votedOut = !tie && topVoted.length === 1 ? topVoted[0].player : null;

    const agentsWin = !!(votedOut && votedOut.isSpy);
    const winnerType: WinnerType = agentsWin ? "Agents" : "Spy";

    const winners: Player[] = agentsWin
        ? players.filter((p) => !p.isSpy)
        : spy
        ? [spy]
        : [];

    if (winners.length > 0) {
        const values: string[] = [];
        const params: (string | number)[] = [];
        let idx = 1;
        for (const winner of winners) {
            values.push(`($${idx++}, $${idx++}, $${idx++})`);
            params.push(Number(roomId), Number(winner.id), winnerType);
        }
        await dbPool.query(
            `INSERT INTO winners (room_id, winner_id, winner_type) VALUES ${values.join(", ")}`,
            params
        );
    }

    return {
        winnerType,
        spy,
        votedOut,
        tie,
        winners,
        voteCounts,
    };
};

export default resolveGameResult;
