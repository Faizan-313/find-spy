import type { dbRoom, socketRoom, Vote } from "../../types/types";
import dbPool from "../../database/db.config";

async function fetchRoomState(roomId: string): Promise<socketRoom | null> {
    const roomResult = await dbPool.query<dbRoom>(
        "SELECT * FROM room WHERE id = $1 LIMIT 1",
        [roomId]
    );
    if (!roomResult.rows.length) return null;
    const room = roomResult.rows[0];

    const playersResult = await dbPool.query<{ id: string; name: string; is_host: boolean; is_spy: boolean; word: string | null }>(
        "SELECT id, name, is_host, is_spy, word FROM player WHERE room_id = $1",
        [roomId]
    );

    const votesResult = await dbPool.query<{
        voter_id: string;
        voter_name: string;
        voter_is_host: boolean;
        votee_id: string;
        votee_name: string;
        votee_is_host: boolean;
    }>(
        `SELECT
            voter.id      AS voter_id,
            voter.name    AS voter_name,
            voter.is_host AS voter_is_host,
            votee.id      AS votee_id,
            votee.name    AS votee_name,
            votee.is_host AS votee_is_host
        FROM vote v
        JOIN player voter ON voter.id = v.voter_id
        JOIN player votee ON votee.id = v.votee_id
        WHERE v.room_id = $1`,
        [roomId]
    );

    // Group individual vote rows by votee
    const votesMap = new Map<string, Vote>();
    for (const row of votesResult.rows) {
        if (!votesMap.has(row.votee_id)) {
            votesMap.set(row.votee_id, {
                voteGivenTo: { id: row.votee_id, name: row.votee_name, isHost: row.votee_is_host },
                voteGivenBy: [],
            });
        }
        votesMap.get(row.votee_id)!.voteGivenBy.push({
            id: row.voter_id,
            name: row.voter_name,
            isHost: row.voter_is_host,
        });
    }

    return {
        id: room.id,
        roomCode: room.room_code,
        name: room.name,
        host: room.host,
        players: playersResult.rows.map((p) => ({
            id: p.id,
            name: p.name,
            isHost: p.is_host,
            isSpy: p.is_spy,
            word: p.word ? p.word : undefined,
        })),
        isVotingStarted: room.is_voting_started,
        isStarted: room.is_started,
        votes: Array.from(votesMap.values()),
    };
}

export default fetchRoomState;
