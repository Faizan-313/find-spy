interface Player {
    id: string;
    name: string;
    isHost: boolean;
    isSpy?: boolean;
    word?: string;
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

type User = {
    roomName: string;
    username: string;
};

type WinnerType = "Spy" | "Agents";

type GameResultPayload = {
    winnerType: WinnerType;
    spy: Player | null;
    votedOut: Player | null;
    tie: boolean;
    winners: Player[];
    voteCounts: { player: Player; count: number }[];
    message?: string;
};

type ResultOverlayProps = {
    result: GameResultPayload;
    didWin: boolean;
    userName: string;
    isHost: boolean;
    onReplay: () => void;
    onClose: () => void;
};

type GameState = "discussion" | "voting" | "ended";

type ChatMessage = { agent: string; msg: string; time: string };

type HistoryEntry = {
    event: string;
    time: string;
    type: "system" | "phase" | "join" | "leave";
};

type VotePanelProps = {
    players: Player[];
    currentPlayerId?: string | number;
    gameState: GameState;
    isVotingPhase: boolean;
    votingTimer: number;
    selectedVote: string;
    hasSubmittedVote: boolean;
    voteCountByPlayerId: Map<string, number>;
    onSelect: (playerId: string) => void;
    onSubmit: () => void;
};


export type {
    Player,
    Vote,
    socketRoom,
    dbRoom,
    User,
    GameResultPayload,
    ResultOverlayProps,
    GameState,
    ChatMessage,
    HistoryEntry,
    WinnerType,
    VotePanelProps,
};