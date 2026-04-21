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

export type { Player, Vote, socketRoom, dbRoom}