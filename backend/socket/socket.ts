import { Server } from "socket.io";
import dbPool from "../database/db.config";
import type { dbRoom } from "../types/types"
import {
    validateRoomName,
    validateAgentName,
    normalizeRoomCode,
    validateRoomCodeFormat,
} from "./helpers/roomValidation";
import fetchRoomState from "./helpers/fetchRoomState"
import {
    handlePlayerLeave,
    cancelPendingLeave,
    pendingLeaves,
    pendingLeaveKey,
    DISCONNECT_LEAVE_GRACE_MS,
    detachSocketsFromRoom,
} from "./helpers/playerLeave";
import { createRoomWithHost, joinRoomByCode, RoomServiceError } from "../services/room.service";
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

            const roomNameErr = validateRoomName(data.roomName);
            if (roomNameErr) {
                socket.emit("error", { message: roomNameErr });
                return;
            }
            const agentErr = validateAgentName(data.username);
            if (agentErr) {
                socket.emit("error", { message: agentErr });
                return;
            }

            const roomName = data.roomName.trim();
            const username = data.username.trim();

            try {
                const newRoom = await createRoomWithHost(roomName, username);

                socket.data.username = username;
                socket.data.roomCode = newRoom.roomCode;
                cancelPendingLeave(username, newRoom.roomCode);

                socket.join(newRoom.roomCode);
                socket.emit("roomUpdated", newRoom);
                io.to(newRoom.roomCode).emit("roomUpdated", newRoom);
            } catch (err) {
                if (err instanceof RoomServiceError) {
                    socket.emit("error", { message: err.message });
                    return;
                }
                console.error("createRoom error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("joinRoom", async (data: { username: string; roomCode: string }) => {
            if (!data.username || !data.roomCode) {
                socket.emit("error", { message: "Username and room code are required" });
                return;
            }

            const agentErr = validateAgentName(data.username);
            if (agentErr) {
                socket.emit("error", { message: agentErr });
                return;
            }
            const username = data.username.trim();
            const roomCode = normalizeRoomCode(data.roomCode);
            const codeErr = validateRoomCodeFormat(roomCode);
            if (codeErr) {
                socket.emit("error", { message: codeErr });
                return;
            }

            try {
                const { state: updatedRoom } = await joinRoomByCode(roomCode, username);

                socket.data.username = username;
                socket.data.roomCode = roomCode;
                cancelPendingLeave(username, roomCode);

                socket.join(roomCode);
                socket.emit("roomUpdated", updatedRoom);
                io.to(roomCode).emit("roomUpdated", updatedRoom);
            } catch (err) {
                if (err instanceof RoomServiceError) {
                    socket.emit("error", { message: err.message });
                    return;
                }
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

                await dbPool.query(
                    "UPDATE room SET is_ended = TRUE, is_started = FALSE, is_voting_started = FALSE WHERE id = $1",
                    [room.id]
                );

                // Prevent disconnect/leave handlers from deleting player rows after everyone navigates away.
                await detachSocketsFromRoom(io, data.roomCode);

                io.to(data.roomCode).emit("gameEnded", {
                    message: "The game has ended!"
                });

            } catch (err) {
                console.error("endGame error:", err);
                socket.emit("error", { message: "Internal server error" });
            }
        });

        socket.on("hostReturnToLobby", async (data: { roomCode: string; username: string }) => {
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
                    socket.emit("error", { message: "Only the host can return everyone to the lobby" });
                    return;
                }

                await dbPool.query(
                    "UPDATE room SET is_started = FALSE, is_voting_started = FALSE, is_ended = FALSE WHERE id = $1",
                    [room.id]
                );
                await dbPool.query("DELETE FROM vote WHERE room_id = $1", [room.id]);
                await dbPool.query(
                    "UPDATE player SET is_spy = FALSE, word = NULL WHERE room_id = $1",
                    [room.id]
                );

                const updatedRoom = await fetchRoomState(room.id);
                if (updatedRoom) {
                    io.to(data.roomCode).emit("returnedToLobby", {
                        message: "The host moved everyone back to the waiting area.",
                        room: updatedRoom,
                    });
                }
            } catch (err) {
                console.error("hostReturnToLobby error:", err);
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

        socket.on("disconnect", async () => {
            console.log("Client disconnected:", socket.id);
            const { username, roomCode } = socket.data as {
                username?: string;
                roomCode?: string;
            };
            if (!username || !roomCode) return;

            cancelPendingLeave(username, roomCode);

            try {
                const endedResult = await dbPool.query<{ is_ended: boolean }>(
                    "SELECT is_ended FROM room WHERE room_code = $1 LIMIT 1",
                    [roomCode]
                );
                if (endedResult.rows[0]?.is_ended) {
                    return;
                }
            } catch (err) {
                console.error("disconnect room lookup error:", err);
                return;
            }

            const key = pendingLeaveKey(username, roomCode);

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
            }, DISCONNECT_LEAVE_GRACE_MS);

            pendingLeaves.set(key, timer);
        });
    });

    return io;
};