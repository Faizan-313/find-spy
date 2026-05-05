import { Server } from "socket.io";
import dbPool from "../database/db.config";
import type { socketRoom, dbRoom, Player} from "../types/types"
import generateRoomCode from "./helpers/generateRoomCode" 
import fetchRoomState from "./helpers/fetchRoomState"
import { handlePlayerLeave, cancelPendingLeave, pendingLeaves, pendingLeaveKey } from "./helpers/playerLeave"
import generateWords from "./helpers/generateWords";
import resolveGameResult from "./helpers/resolveGameResult";

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
                //check if this user is already hosting an active room
                const existingRoomResult = await dbPool.query<{ id: string; is_ended: boolean }>(
                    "SELECT id, is_ended FROM room WHERE host = $1 ORDER BY created_at DESC LIMIT 1",
                    [data.username]
                );

                if (existingRoomResult.rows.length > 0 && existingRoomResult.rows[0].is_ended === false) {
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
                cancelPendingLeave(data.username, roomCode);

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

                if (room.is_ended) {
                    socket.emit("error", { message: "Game has already ended" });
                    return;
                }

                // Allow an existing player (by username) to rejoin at any time, even
                // after the game has started. 
                const duplicateResult = await dbPool.query(
                    "SELECT id FROM player WHERE room_id = $1 AND name = $2 LIMIT 1",
                    [room.id, data.username]
                );

                if (duplicateResult.rows.length > 0) {
                    socket.data.username = data.username;
                    socket.data.roomCode = data.roomCode;

                    cancelPendingLeave(data.username, data.roomCode);
                    socket.join(room.room_code);

                    const currentRoom = await fetchRoomState(room.id);

                    io.to(room.room_code).emit("roomUpdated", currentRoom);
                    return;
                }

                // Only block brand new players from joining a started game.
                if (room.is_started) {
                    socket.emit("error", { message: "Game has already started please wait!" });
                    return;
                }

                const countResult = await dbPool.query<{ count: string }>(
                    "SELECT COUNT(*) AS count FROM player WHERE room_id = $1",
                    [room.id]
                );

                if (parseInt(countResult.rows[0].count, 10) >= 8) {
                    socket.emit("error", { message: "Room is full" });
                    return;
                }

                await dbPool.query(
                    "INSERT INTO player (name, is_host, room_id) VALUES ($1, $2, $3)",
                    [data.username, false, room.id]
                );

                // Store on socket for disconnect cleanup
                socket.data.username = data.username;
                socket.data.roomCode = data.roomCode;

                cancelPendingLeave(data.username, data.roomCode);

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

                const playersResult = await dbPool.query<{ id: string; name: string; is_host: boolean }>(
                    "SELECT id, name, is_host FROM player WHERE room_id = $1",
                    [room.id]
                );

                if (playersResult.rows.length < 2) {
                    socket.emit("error", { message: "Need at least 2 players to start the game" });
                    return;
                }

                const words: {word1: string, word2: string} = generateWords();
                const spyPlayerIndex = Math.floor(Math.random() * playersResult.rows.length);

                await dbPool.query(
                    "UPDATE room SET is_started = TRUE WHERE id = $1",
                    [room.id]
                );

                // Update all players with spy and word info
                for (let i = 0; i < playersResult.rows.length; i++) {
                    const isSpy = i === spyPlayerIndex;
                    const word = isSpy ? words.word1 : words.word2;
                    
                    await dbPool.query(
                        "UPDATE player SET is_spy = $1, word = $2 WHERE id = $3",
                        [isSpy, word, playersResult.rows[i].id]
                    );
                }

                // Fetch updated room state
                const updatedRoom = await fetchRoomState(room.id);

                if (updatedRoom) {
                    io.to(data.roomCode).emit("gameStarted", {
                        message: "Game has started!",
                        players: updatedRoom.players,
                    });
                }

            
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

                io.to(data.roomCode).emit("votingStarted", { message: "Voting has started!" });
                io.to(data.roomCode).emit("roomUpdated", updatedRoom);
            } catch (err) {
                console.error("startVoting error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("submitVote", async (data: { roomCode: string; voteeId: string; username: string }) => {
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

                // Tally votes, decide winners, persist into the `winners` table.
                const result = await resolveGameResult(room.id);

                // Close voting 
                // reveals the winner.
                await dbPool.query(
                    "UPDATE room SET is_voting_started = FALSE WHERE id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);

                io.to(data.roomCode).emit("endVoting", { message: "Voting has ended!" });
                io.to(data.roomCode).emit("roomUpdated", updatedRoom);
                io.to(data.roomCode).emit("gameResult", {
                    winnerType: result.winnerType,
                    spy: result.spy,
                    votedOut: result.votedOut,
                    tie: result.tie,
                    winners: result.winners,
                    voteCounts: result.voteCounts,
                    message:
                        result.winnerType === "Agents"
                            ? "Agents win! The spy has been exposed."
                            : "The spy wins! Identity concealed.",
                });
            } catch (err) {
                console.error("endVoting error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("restartGame", async (data: { roomCode: string; username: string }) => {
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
                    socket.emit("error", { message: "Only the host can start a new mission" });
                    return;
                }

                const playersResult = await dbPool.query<{ id: string; name: string; is_host: boolean }>(
                    "SELECT id, name, is_host FROM player WHERE room_id = $1",
                    [room.id]
                );

                if (playersResult.rows.length < 2) {
                    socket.emit("error", { message: "Need at least 2 players to start a new mission" });
                    return;
                }

                // Wipe previous round's votes; keep the winners audit log intact.
                await dbPool.query("DELETE FROM vote WHERE room_id = $1", [room.id]);

                const words: { word1: string; word2: string } = generateWords();
                const spyPlayerIndex = Math.floor(Math.random() * playersResult.rows.length);

                for (let i = 0; i < playersResult.rows.length; i++) {
                    const isSpy = i === spyPlayerIndex;
                    const word = isSpy ? words.word1 : words.word2;
                    await dbPool.query(
                        "UPDATE player SET is_spy = $1, word = $2 WHERE id = $3",
                        [isSpy, word, playersResult.rows[i].id]
                    );
                }

                await dbPool.query(
                    "UPDATE room SET is_started = TRUE, is_voting_started = FALSE, is_ended = FALSE WHERE id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);

                if (updatedRoom) {
                    io.to(data.roomCode).emit("gameStarted", {
                        message: "New mission started — new words are in play!",
                        players: updatedRoom.players,
                    });
                    io.to(data.roomCode).emit("roomUpdated", updatedRoom);
                }
            } catch (err) {
                console.error("restartGame error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("leaveRoom", async (data: { roomCode: string; username: string }) => {
            if (!data.roomCode || !data.username) {
                socket.emit("error", { message: "Room code and username are required" });
                socket.emit("leftRoom", { message: "Left room" });
                return;
            }

            // Prevent duplicate leave handling on disconnect after explicit leave.
            socket.data.username = undefined;
            socket.data.roomCode = undefined;
            
            cancelPendingLeave(data.username, data.roomCode);

            try {
                await handlePlayerLeave(socket, io, data.roomCode, data.username);
            } catch (err) {
                console.error("leaveRoom error:", err);
            } finally {
                socket.emit("leftRoom", { message: "Left room successfully" });
            }
        });

        socket.on("endGame", async (data: { roomCode: string; username: string }) => {
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
                    socket.emit("error", { message: "Only the host can end the game" });
                    return;
                }

                // End the game
                await dbPool.query(
                    "UPDATE room SET is_ended = TRUE WHERE id = $1",
                    [room.id]
                );

                io.to(data.roomCode).emit("gameEnded", {
                    message: "The game has ended!"
                });

            } catch (err) {
                console.error("endGame error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("sendMessage", (data: { roomCode: string; username: string; message: string}) => {
            if(!data.roomCode || !data.username || !data.message){
                socket.emit("error", {message: "Room code, username and message are required"});
                return;
            }

            io.to(data.roomCode).emit("chatMessage", {
                playerName: data.username,
                message: data.message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        })

        socket.on("typing", (data: {roomCode: string, username: string})=>{
            if(!data.roomCode || !data.username){
                socket.emit("error", {message: "Room code and username are required"});
                return;
            }
            socket.to(data.roomCode).emit("userTyping", { username: data.username });
        })

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            const { username, roomCode } = socket.data as {
                username?: string;
                roomCode?: string;
            };
            if (!username || !roomCode) return;

            // Schedule a delayed leave; any fresh socket from the same user in the
            // same room within the grace window cancels this via cancelPendingLeave.
            const key = pendingLeaveKey(username, roomCode);
            const existing = pendingLeaves.get(key);
            if (existing) clearTimeout(existing);

            const timer = setTimeout(async () => {
                pendingLeaves.delete(key);
                try {
                    const stillConnected = Array.from(io.sockets.sockets.values()).some(
                        (connectedSocket: any) =>
                            connectedSocket.data?.username === username &&
                            connectedSocket.data?.roomCode === roomCode
                    );
                    if (stillConnected) return;
                    await handlePlayerLeave(socket, io, roomCode, username);
                } catch (err) {
                    console.error("disconnect cleanup error:", err);
                }
            }, 5000);

            pendingLeaves.set(key, timer);
        });
    });

    return io;
};