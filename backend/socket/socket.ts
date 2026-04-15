import { Server } from "socket.io";
import dbPool from "../database/db.config";

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

interface Vote {
    voteGivenTo: Player;
    voteGivenBy: Player[];
}

interface socketRoom {
    id: string;
    roomCode: string;
    name: string;
    host: string;
    players: Player[];
    isVotingStarted?: boolean;
    isStarted?: boolean;
    votes: Vote[];
}

interface dbRoom {
    id: string;
    name: string;
    host: string;
    room_code: string;
    is_voting_started: boolean;
    is_ended: boolean;
    is_started: boolean;
    created_at: Date;
    updated_at: Date;
}

const generateRoomCode = (roomName: string, username: string): string => {
    return (
        roomName.toUpperCase() +
        username.slice(0, 2).toUpperCase() +
        Math.floor(1000 * Math.random() + 38).toString()
    );
};

async function fetchRoomState(roomId: string): Promise<socketRoom | null> {
    const roomResult = await dbPool.query<dbRoom>(
        "SELECT * FROM room WHERE id = $1 LIMIT 1",
        [roomId]
    );
    if (!roomResult.rows.length) return null;
    const room = roomResult.rows[0];

    const playersResult = await dbPool.query<{ id: string; name: string; is_host: boolean }>(
        "SELECT id, name, is_host FROM player WHERE room_id = $1",
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
        })),
        isVotingStarted: room.is_voting_started,
        isStarted: room.is_started,
        votes: Array.from(votesMap.values()),
    };
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

    if (room.host === username) {
        // Host leaving mark room ended and evict all sockets
        await dbPool.query(
            "UPDATE room SET is_ended = TRUE, is_started = FALSE, is_voting_started = FALSE WHERE id = $1",
            [room.id]
        );
        io.to(roomCode).emit("roomEnded", { message: "The host has left. The room has been closed." });
        const sockets = await io.in(roomCode).fetchSockets();
        for (const s of sockets) s.leave(roomCode);
    } else {
        // Regular player remove from DB and notify remaining players
        await dbPool.query(
            "DELETE FROM player WHERE name = $1 AND room_id = $2",
            [username, room.id]
        );
        socket.leave(roomCode);

        const updatedRoom = await fetchRoomState(room.id);
        io.to(roomCode).emit("roomUpdated", updatedRoom);
    }
}

export const setUpSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("createRoom", async (data: { username: string; roomName: string }) => {
            if (!data.username || !data.roomName) {
                socket.emit("error", { message: "Username and room name are required" });
                return;
            }

            try {
                const existingRoomResult = await dbPool.query<{ id: string; is_ended: boolean }>(
                    "SELECT id, is_ended FROM room WHERE host = $1 ORDER BY created_at DESC LIMIT 1",
                    [data.username]
                );

                if (
                    existingRoomResult.rows.length > 0 &&
                    existingRoomResult.rows[0].is_ended === false
                ) {
                    socket.emit("error", {
                        message: "You are already hosting a live room. Please end that room before creating a new one.",
                    });
                    return;
                }

                const roomCode = generateRoomCode(data.roomName, data.username);

                const roomResult = await dbPool.query<{ id: string }>(
                    "INSERT INTO room (name, host, room_code) VALUES ($1, $2, $3) RETURNING id",
                    [data.roomName, data.username, roomCode]
                );

                if (!roomResult.rows.length) {
                    socket.emit("error", { message: "Failed to create room" });
                    return;
                }

                const roomId = roomResult.rows[0].id;

                const playerResult = await dbPool.query<{ id: string }>(
                    "INSERT INTO player (name, is_host, room_id) VALUES ($1, $2, $3) RETURNING id",
                    [data.username, true, roomId]
                );

                if (!playerResult.rows.length) {
                    socket.emit("error", { message: "Failed to create host player" });
                    return;
                }

                // Store on socket for disconnect cleanup
                socket.data.username = data.username;
                socket.data.roomCode = roomCode;

                const newRoom: socketRoom = {
                    id: roomId,
                    roomCode,
                    name: data.roomName,
                    host: data.username,
                    players: [{ id: playerResult.rows[0].id, name: data.username, isHost: true }],
                    isVotingStarted: false,
                    isStarted: false,
                    votes: [],
                };
                
                socket.join(roomCode);
                io.to(roomCode).emit("roomUpdated", newRoom);
            } catch (err) {
                console.error("createRoom error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("joinRoom", async (data: { username: string; roomCode: string }) => {
            if (!data.username || !data.roomCode) {
                socket.emit("error", { message: "Username and room code are required" });
                return;
            }

            try {
                const roomResult = await dbPool.query<dbRoom>(
                    "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
                    [data.roomCode]
                );

                if (!roomResult.rows.length) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }

                const room = roomResult.rows[0];

                if (room.is_started) {
                    socket.emit("error", { message: "Game has already started" });
                    return;
                }
                if (room.is_ended) {
                    socket.emit("error", { message: "Game has already ended" });
                    return;
                }

                const countResult = await dbPool.query<{ count: string }>(
                    "SELECT COUNT(*) AS count FROM player WHERE room_id = $1",
                    [room.id]
                );

                if (parseInt(countResult.rows[0].count, 10) >= 10) {
                    socket.emit("error", { message: "Room is full" });
                    return;
                }

                const duplicateResult = await dbPool.query(
                    "SELECT id FROM player WHERE room_id = $1 AND name = $2 LIMIT 1",
                    [room.id, data.username]
                );

                if (duplicateResult.rows.length > 0) {
                    socket.emit("error", { message: "Username is already taken in this room" });
                    return;
                }

                await dbPool.query(
                    "INSERT INTO player (name, is_host, room_id) VALUES ($1, $2, $3)",
                    [data.username, false, room.id]
                );

                // Store on socket for disconnect cleanup
                socket.data.username = data.username;
                socket.data.roomCode = data.roomCode;

                const updatedRoom = await fetchRoomState(room.id);

                socket.join(room.room_code);
                io.to(room.room_code).emit("roomUpdated", updatedRoom);
            } catch (err) {
                console.error("joinRoom error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("startGame", async (data: { roomCode: string; username: string }) => {
            if (!data.roomCode || !data.username) {
                socket.emit("error", { message: "Room code and username are required" });
                return;
            }

            try {
                const roomResult = await dbPool.query<dbRoom>(
                    "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
                    [data.roomCode]
                );

                if (!roomResult.rows.length) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }

                const room = roomResult.rows[0];

                if (room.host !== data.username) {
                    socket.emit("error", { message: "Only the host can start the game" });
                    return;
                }

                if (room.is_started) {
                    socket.emit("error", { message: "Game has already started" });
                    return;
                }

                if (room.is_ended) {
                    socket.emit("error", { message: "This room has ended" });
                    return;
                }

                await dbPool.query(
                    "UPDATE room SET is_started = TRUE WHERE id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);

                io.to(data.roomCode).emit("startGame", { message: "Game has started!" });
                io.to(data.roomCode).emit("roomUpdated", updatedRoom);
            } catch (err) {
                console.error("startGame error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("startVoting", async (data: { roomCode: string; username: string }) => {
            if (!data.roomCode || !data.username) {
                socket.emit("error", { message: "Room code and username are required" });
                return;
            }

            try {
                const roomResult = await dbPool.query<dbRoom>(
                    "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
                    [data.roomCode]
                );

                if (!roomResult.rows.length) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }

                const room = roomResult.rows[0];

                if (room.host !== data.username) {
                    socket.emit("error", { message: "Only the host can start voting" });
                    return;
                }

                if (!room.is_started) {
                    socket.emit("error", { message: "Game has not started yet" });
                    return;
                }

                if (room.is_voting_started) {
                    socket.emit("error", { message: "Voting has already started" });
                    return;
                }

                await dbPool.query(
                    "UPDATE room SET is_voting_started = TRUE WHERE id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);

                io.to(data.roomCode).emit("startVoting", { message: "Voting has started!" });
                io.to(data.roomCode).emit("roomUpdated", updatedRoom);
            } catch (err) {
                console.error("startVoting error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on(
            "submitVote",
            async (data: { roomCode: string; voteeId: string; username: string }) => {
                if (!data.roomCode || !data.voteeId || !data.username) {
                    socket.emit("error", { message: "Room code, votee ID and username are required" });
                    return;
                }

                try {
                    const roomResult = await dbPool.query<dbRoom>(
                        "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
                        [data.roomCode]
                    );

                    if (!roomResult.rows.length) {
                        socket.emit("error", { message: "Room not found" });
                        return;
                    }

                    const room = roomResult.rows[0];

                    if (!room.is_voting_started) {
                        socket.emit("error", { message: "Voting has not started yet" });
                        return;
                    }

                    // Resolve voter's DB player id from their username + room
                    const voterResult = await dbPool.query<{ id: string }>(
                        "SELECT id FROM player WHERE name = $1 AND room_id = $2 LIMIT 1",
                        [data.username, room.id]
                    );

                    if (!voterResult.rows.length) {
                        socket.emit("error", { message: "You are not a player in this room" });
                        return;
                    }

                    const voterId = voterResult.rows[0].id;

                    // Confirm votee exists in this room
                    const voteeResult = await dbPool.query<{ id: string }>(
                        "SELECT id FROM player WHERE id = $1 AND room_id = $2 LIMIT 1",
                        [data.voteeId, room.id]
                    );

                    if (!voteeResult.rows.length) {
                        socket.emit("error", { message: "The player you voted for is not in this room" });
                        return;
                    }

                    if (voterId === data.voteeId) {
                        socket.emit("error", { message: "You cannot vote for yourself" });
                        return;
                    }

                    // Re-voting simply updates the existing row to a new target.
                    await dbPool.query(
                        `INSERT INTO vote (voter_id, votee_id, room_id)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (voter_id, room_id)
                        DO UPDATE SET votee_id = EXCLUDED.votee_id`,
                        [voterId, data.voteeId, room.id]
                    );

                    const updatedRoom = await fetchRoomState(room.id);

                    socket.emit("voteSubmitted", { message: "Vote submitted" });
                    io.to(data.roomCode).emit("roomUpdated", updatedRoom);
                } catch (err) {
                    console.error("submitVote error:", err);
                    socket.emit("error", { message: "Internal server error" });
                }
            }
        );

        socket.on("endVoting", async (data: { roomCode: string; username: string }) => {
            if (!data.roomCode || !data.username) {
                socket.emit("error", { message: "Room code and username are required" });
                return;
            }

            try {
                const roomResult = await dbPool.query<dbRoom>(
                    "SELECT * FROM room WHERE room_code = $1 LIMIT 1",
                    [data.roomCode]
                );

                if (!roomResult.rows.length) {
                    socket.emit("error", { message: "Room not found" });
                    return;
                }

                const room = roomResult.rows[0];

                if (room.host !== data.username) {
                    socket.emit("error", { message: "Only the host can end voting" });
                    return;
                }

                if (!room.is_voting_started) {
                    socket.emit("error", { message: "Voting has not started" });
                    return;
                }

                await dbPool.query(
                    "UPDATE room SET is_voting_started = FALSE WHERE id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);

                io.to(data.roomCode).emit("endVoting", { message: "Voting has ended!" });
                io.to(data.roomCode).emit("roomUpdated", updatedRoom);
            } catch (err) {
                console.error("endVoting error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("leaveRoom", async (data: { roomCode: string; username: string }) => {
            if (!data.roomCode || !data.username) {
                socket.emit("error", { message: "Room code and username are required" });
                return;
            }

            try {
                await handlePlayerLeave(socket, io, data.roomCode, data.username);
            } catch (err) {
                console.error("leaveRoom error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("disconnect", async () => {
            console.log("Client disconnected:", socket.id);
            const { username, roomCode } = socket.data as {
                username?: string;
                roomCode?: string;
            };
            if (username && roomCode) {
                try {
                    await handlePlayerLeave(socket, io, roomCode, username);
                } catch (err) {
                    console.error("disconnect cleanup error:", err);
                }
            }
        });
    });

    return io;
};