import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-hot-toast/headless";

import type {
    Player,
    Vote,
    socketRoom,
    GameResultPayload,
    GameState,
    ChatMessage,
    HistoryEntry,
} from "../../types/types";
import { fireConfetti, nowTime } from "../../utils/utils";

import GameHeader from "./components/GameHeader"
import PlayerList from "./components/PlayerList";
import ChatPanel from "./components/ChatPanel";
import VotePanel from "./components/VotePanel";
import WinnersPanel from "./components/WinnersPanel";
import GameHistory from "./components/GameHistory";
import HostControls from "./components/HostControls";
import ResultOverlay from "./components/ResultOverlay";

const Game = () => {
    const location = useLocation();
    const navigation = useNavigate();

    const {
        roomName,
        players: initialPlayers,
        userName,
        roomCode,
    } = (location.state ?? {}) as {
        roomName: string;
        players: Player[];
        userName: string;
        roomCode: string;
    };

    const socketRef = useRef<Socket | null>(null);
    const votingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [players, setPlayers] = useState<Player[]>(initialPlayers ?? []);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [word, setWord] = useState<string>("");
    const [isSpy, setIsSpy] = useState<boolean>(false);

    const [gameState, setGameState] = useState<GameState>("discussion");
    const [selectedVote, setSelectedVote] = useState<string>("");
    const [hasSubmittedVote, setHasSubmittedVote] = useState<boolean>(false);
    const [votingTimer, setVotingTimer] = useState<number>(0);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState<string>("");

    const [gameHistory, setGameHistory] = useState<HistoryEntry[]>([]);

    const [gameResult, setGameResult] = useState<GameResultPayload | null>(null);
    const [showResult, setShowResult] = useState<boolean>(false);

    const currentPlayer = useMemo(
        () => players.find((p) => p.name === userName),
        [players, userName]
    );
    const isHost = !!currentPlayer?.isHost;
    const isVotingPhase = gameState === "voting";

    const voteCountByPlayerId = useMemo(() => {
        const map = new Map<string, number>();
        for (const v of votes) {
            map.set(String(v.voteGivenTo.id), v.voteGivenBy.length);
        }
        return map;
    }, [votes]);

    const pushHistory = (entry: Omit<HistoryEntry, "time">) =>
        setGameHistory((prev) => [...prev, { ...entry, time: nowTime() }]);

    useEffect(() => {
        if (!roomCode || !userName) {
            navigation("/create-room");
            return;
        }

        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("joinRoom", { roomCode, username: userName });
        });

        socket.on("error", (err: { message?: string }) => {
            if (err?.message) toast.error(err.message);
        });

        socket.on("connect_error", () => {
            toast.error("Connection error. Please check your internet");
        });

        socket.on("roomEnded", (msg: { message?: string }) => {
            toast.error(msg?.message || "The room has been closed by the host");
            navigation("/create-room");
        });

        socket.on("leftRoom", () => {
            navigation("/create-room");
        });

        socket.on("roomUpdated", (room: socketRoom | null) => {
            if (!room) return;

            setPlayers((prev) => {
                const prevNames = new Set(prev.map((p) => p.name));
                const nextNames = new Set(room.players.map((p) => p.name));

                for (const p of room.players) {
                    if (!prevNames.has(p.name) && p.name !== userName) {
                        pushHistory({ event: `${p.name} joined`, type: "join" });
                    }
                }
                for (const p of prev) {
                    if (!nextNames.has(p.name)) {
                        pushHistory({ event: `${p.name} left`, type: "leave" });
                    }
                }

                return room.players;
            });

            setVotes(room.votes ?? []);

            setGameState((current) => {
                if (current === "ended") return current;
                return room.isVotingStarted ? "voting" : "discussion";
            });

            if (!room.isVotingStarted) {
                setVotingTimer(0);
                setHasSubmittedVote(false);
                if (votingTimerRef.current) clearInterval(votingTimerRef.current);
            }

            const me = room.players.find((p) => p.name === userName);
            if (me?.word) setWord(me.word);
            if (typeof me?.isSpy === "boolean") setIsSpy(me.isSpy);
        });

        socket.on("gameStarted", (gameData: { message: string; players: Player[] }) => {
            const me = gameData.players.find((p) => p.name === userName);
            if (me) {
                if (me.word) setWord(me.word);
                if (typeof me.isSpy === "boolean") setIsSpy(me.isSpy);
                toast.success(gameData.message || "Game has started!");
            }
            setGameState("discussion");
            setPlayers(gameData.players);
            setVotes([]);
            setSelectedVote("");
            setHasSubmittedVote(false);
            setVotingTimer(0);
            setGameResult(null);
            setShowResult(false);
            pushHistory({ event: "Game started", type: "system" });
        });

        socket.on("votingStarted", (data: { message?: string } = {}) => {
            setGameState("voting");
            setSelectedVote("");
            setHasSubmittedVote(false);
            setVotingTimer(120);
            toast.success(data?.message || "Voting phase has started!");
            pushHistory({ event: "Voting phase started", type: "phase" });
        });

        socket.on("endVoting", (data: { message?: string } = {}) => {
            setGameState("discussion");
            setVotingTimer(0);
            setSelectedVote("");
            setHasSubmittedVote(false);
            if (votingTimerRef.current) clearInterval(votingTimerRef.current);
            toast.success(data?.message || "Voting has ended");
            pushHistory({ event: "Voting phase ended", type: "phase" });
        });

        socket.on("voteSubmitted", (data: { message?: string } = {}) => {
            setHasSubmittedVote(true);
            toast.success(data?.message || "Vote submitted");
        });

        socket.on("gameResult", (payload: GameResultPayload) => {
            setGameResult(payload);
            setShowResult(true);
            setGameState("ended");
            pushHistory({
                event:
                    payload.winnerType === "Agents"
                        ? "Agents won — spy exposed"
                        : payload.tie
                        ? "Spy won — vote was tied"
                        : "Spy won — identity concealed",
                type: "system",
            });
        });

        socket.on("gameEnded", (data: { message?: string } = {}) => {
            setGameState("ended");
            toast.success(data?.message || "Game has ended!");
            pushHistory({ event: "Game ended", type: "system" });
        });

        socket.on("chatMessage", (data: { playerName: string; message: string; timestamp: string }) => {
            setChatMessages((prev) => [
                ...prev,
                { agent: data.playerName, msg: data.message, time: data.timestamp },
            ]);
        });

        return () => {
            socket.removeAllListeners();
            if (votingTimerRef.current) clearInterval(votingTimerRef.current);
            socket.disconnect();
        };
    }, [navigation, userName, roomName, roomCode]);

    const didWin = useMemo(() => {
        if (!gameResult || !currentPlayer) return false;
        const me = String(currentPlayer.id);
        return gameResult.winners.some((w) => String(w.id) === me);
    }, [gameResult, currentPlayer]);

    useEffect(() => {
        if (showResult && didWin) fireConfetti();
    }, [showResult, didWin]);

    useEffect(() => {
        if (votingTimer > 0 && isVotingPhase) {
            votingTimerRef.current = setInterval(() => {
                setVotingTimer((prev) => {
                    if (prev <= 1) {
                        if (votingTimerRef.current) clearInterval(votingTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (votingTimerRef.current) {
            clearInterval(votingTimerRef.current);
        }

        return () => {
            if (votingTimerRef.current) clearInterval(votingTimerRef.current);
        };
    }, [votingTimer, isVotingPhase]);

    const handleLeaveRoom = () => {
        if (!socketRef.current) {
            navigation("/create-room");
            return;
        }
        socketRef.current.emit("leaveRoom", { roomCode, username: userName });
    };

    const handleStartVoting = () => {
        socketRef.current?.emit("startVoting", { roomCode, username: userName });
    };

    const handleSubmitVote = () => {
        if (!selectedVote) {
            toast.error("Please select a player to vote");
            return;
        }
        socketRef.current?.emit("submitVote", {
            roomCode,
            username: userName,
            voteeId: selectedVote,
        });
    };

    const handleEndVoting = () => {
        socketRef.current?.emit("endVoting", { roomCode, username: userName });
    };

    const handleEndGame = () => {
        socketRef.current?.emit("endGame", { roomCode, username: userName });
    };

    const handleRestartGame = () => {
        socketRef.current?.emit("restartGame", { roomCode, username: userName });
    };

    const handleSendMessage = () => {
        // NOTE: chat transport intentionally left for later integration.
        if (!chatInput.trim()) return;
        setChatInput("");
    };

    return (
        <div
            className="min-h-screen bg-[#0a0a0a] flex flex-col px-4 py-6"
            style={{
                backgroundImage: `radial-gradient(ellipse at 70% 20%, rgba(0,255,100,0.04) 0%, transparent 55%),
                                    radial-gradient(ellipse at 10% 80%, rgba(255,0,0,0.05) 0%, transparent 50%)`,
            }}
        >
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`,
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
                <GameHeader
                    roomName={roomName}
                    word={word}
                    isSpy={isSpy}
                    gameState={gameState}
                    isVotingPhase={isVotingPhase}
                    votingTimer={votingTimer}
                    onLeaveRoom={handleLeaveRoom}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <PlayerList
                        players={players}
                        userName={userName}
                        isVotingPhase={isVotingPhase}
                        voteCountByPlayerId={voteCountByPlayerId}
                    />

                    <div className="lg:col-span-6 flex flex-col gap-5">
                        <ChatPanel
                            messages={chatMessages}
                            input={chatInput}
                            onInputChange={setChatInput}
                            onSend={handleSendMessage}
                        />

                        <VotePanel
                            players={players}
                            currentPlayerId={currentPlayer?.id}
                            gameState={gameState}
                            isVotingPhase={isVotingPhase}
                            votingTimer={votingTimer}
                            selectedVote={selectedVote}
                            hasSubmittedVote={hasSubmittedVote}
                            voteCountByPlayerId={voteCountByPlayerId}
                            onSelect={setSelectedVote}
                            onSubmit={handleSubmitVote}
                        />
                    </div>

                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {gameResult && <WinnersPanel result={gameResult} userName={userName} />}
                        <GameHistory history={gameHistory} />
                    </div>
                </div>

                {isHost && (
                    <HostControls
                        gameState={gameState}
                        onStartVoting={handleStartVoting}
                        onEndVoting={handleEndVoting}
                        onEndGame={handleEndGame}
                        onRestartGame={handleRestartGame}
                    />
                )}
            </div>

            {showResult && gameResult && (
                <ResultOverlay
                    result={gameResult}
                    didWin={didWin}
                    userName={userName}
                    isHost={isHost}
                    onReplay={handleRestartGame}
                    onClose={() => setShowResult(false)}
                />
            )}
        </div>
    );
};

export default Game;
