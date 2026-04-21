interface Player {
    id: string;
    name: string;
    isHost: boolean;
    isSpy?: boolean;
    word?: string;
}

interface dbPlayer {
    id: string;
    name: string;
    room_id: string;
    is_host: boolean;
    is_spy: boolean;
    word: string | null;
    created_at: Date;
    updated_at: Date;
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

export type { Player, Vote, socketRoom, dbRoom, dbPlayer}