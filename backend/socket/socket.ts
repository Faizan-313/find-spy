import { Server } from "socket.io"

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

interface Vote {
    voteGivenTo: Player;
    voteGivenBy: Player[];
}

interface Room {
    id: string;
    name: string;
    host: string;
    players: Player[];
    isVotingStarted?: boolean;
    isStarted?: boolean;
    votes: Vote[];
}


const generateRoomCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const setUpSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log("Client connected:", socket.id);

        // Host creates a room
        socket.on('createRoom', (data: {username: string, roomName: string}) => {
            const roomCode = generateRoomCode()
            const newRoom: Room = {
                id: roomCode,
                name: data.roomName,
                host: socket.id,
                players: [{ id: socket.id, name: data.username, isHost: true}],
                isVotingStarted: false,
                isStarted: false,
                votes: []
            }
            
            //store the room in db
            const roomCreated = true; //replace
            if(!roomCreated){
                socket.emit('error', {message: "Failed to create room"})
                return
            }

            socket.join(roomCode);
            io.to(newRoom.id).emit('roomUpdated', newRoom);
        })

        // Member joins a room
        socket.on('joinRoom', (data: {username: string, roomCode: string}) => {
            //find the room in db using data.roomCode
            const room: Room = null; //replace with db query result

            if(!room){
                socket.emit('error', {message: "Room not found"})
                return
            }

            //check if the game is started
            if(room.isStarted){
                socket.emit('error', {message: "Game has already started please wait for the next game"})
                return
            }

            if(room.players.length >= 10){
                socket.emit('error', {message: "Room is full"})
                return
            }

            //add player to the room
            room.players.push({id: socket.id, name: data.username, isHost: false});
            const updatedRoom: Room = null; 

            socket.join(room.id);
            io.to(room.id).emit('roomUpdated', updatedRoom);
        })

        //start game
        socket.on('startGame', (data: {roomCode: string})=> {
            //find the room in db
            const room: Room = null; //
            if(!room || room.host !== socket.id){
                socket.emit('error', {message: "Room not found or you are not the host"})
                return
            }
            room.isStarted = true;
            //update the room in db
            const updatedRoom: Room = null; //replace 

            io.to(room.id).emit('startGame', {message: "Game has started!"})
            socket.emit('roomUpdated', updatedRoom)
        })


        // Start voting
        socket.on('startVoting', (data: {roomCode: string}) => {
            //find the room in db 
            const room: Room = null; //replace by db query

            if(!room){
                socket.emit('error', {message: "Room not found"})
                return
            }
            room.isVotingStarted = true;
            //update the room in db
            const updatedRoom: Room = null; //replace by db update

            io.to(room.id).emit('startVoting', {message: "Voting has started!"})
            io.to(room.id).emit('roomUpdated', updatedRoom);
        })


        // Player votes
        socket.on("submitVote", (data: {roomCode: string, voteGiven: Player, username: string}) => {
            //find the room in db
            const room: Room = null; //will replace
            if(!room){
                socket.emit('error', {message: "Room not found"})
                return
            }

            //check if voting has started
            if(!room.isVotingStarted){
                socket.emit('error', {message: "Voting has not started yet"})
                return
            }

            //check if the player has already voted for the same person
            const existingVote = room.votes.find(vote => vote.voteGivenTo.id === data.voteGiven.id && vote.voteGivenBy.some(voter => voter.id === socket.id));
            if(existingVote){
                socket.emit('error', {message: "You have already voted for this player"})
                return
            }

            //if the player has already voted for someone else, remove that vote
            room.votes.forEach(vote => {
                const voterIndex = vote.voteGivenBy.findIndex(voter => voter.id === socket.id);
                if(voterIndex !== -1){
                    vote.voteGivenBy.splice(voterIndex, 1);
                }
            })

            const newVote: Vote = {
                voteGivenTo: { id: data.voteGiven.id, name: data.voteGiven.name, isHost: data.voteGiven.isHost},
                voteGivenBy: [{ id: socket.id, name: data.username, isHost: room.host === socket.id ? true: false}]
            }

            //update the room with the new vote in db
            const updatedRoom: Room = null; //replace by db update

            socket.emit('voteSubmitted', newVote);
            io.to(room.id).emit('roomUpdated', updatedRoom);
        })


        // End voting
        socket.on('endVoting', (data: {roomCode: string}) => {
            //find the room in db
            const room: Room = null; //replace
            if(!room || room.host !== socket.id){
                socket.emit('error', {message: "Room not found or you are not the host"})
                return
            }
            if(!room.isVotingStarted){
                socket.emit('error', {message: "Voting has not started "})
                return
            }
            socket.to(room.id).emit('endVoting', {message: "Voting has ended!"})
            room.isVotingStarted = false;
            //update the room in db
            const updatedRoom: Room = null; //replace by db
            socket.emit('roomUpdated', updatedRoom);
        })


        // Leave room
        socket.on('leaveRoom', (data: {roomCode: string}) => {
            const room: Room = null;
            if(!room){
                socket.emit('error', {message: "Room not found"})
                return
            }
            socket.leave(room.id);
            socket.emit('roomUpdated', room);
        })

        socket.on('disconnect', () => {
            // Auto-leave room on disconnect
            const room: Room = null;
            if(!room){
                socket.emit('error', {message: "Room not found"})
                return
            }
            socket.leave(room.id);
            socket.emit('roomUpdated', room);
        });
    });

    return io;
};

