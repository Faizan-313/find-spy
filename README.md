# Spy Game Web App

An interactive multiplayer web-based game where players try to identify the "spy" among them. Each player receives same word — except one player (the spy), who gets a different word. Players communicate, analyze responses, and vote to find the spy.

---

## Features

- Multiplayer game rooms
- Random word assignment (with one spy)
- Real-time discussion (chat-based)   {future integration}
- Voting system to identify the spy
- Real-time updates 
- Game results and winner announcement

---

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Nodejs
- Express

### Database
- PostgresSQL 

### Real-Time Communication
- Socket.io

---

## Project Structure

```
spy-game/
│
├── client/             # Frontend (React)
│   ├──src/ 
|       ├──components/
|       |     ├──Footer.tsx
|       |     ├──Navbar.tsx
|       ├──pages/
|       |     ├──GameSection/
|       |     |     ├──components/
|       |     |     |       ├──ChatPanel.tsx
|       |     |     |       ├──GameHeader.tsx
|       |     |     |       ├──GameHistory.tsx
|       |     |     |       ├──HostControls.tsx
|       |     |     |       ├──PlayerList.tsx
|       |     |     |       ├──ResultOverlay.tsx
|       |     |     |       ├──VotePanel.tsx
|       |     |     |       ├──WinnersPannel.tsx
|       |     |     ├──Game.tsx
|       |     ├──CreateRoom.tsx
|       |     ├──Home.tsx
|       |     ├──JoinRoom.tsx
|       |     ├──RoomWaiting.tsx
|       ├──types/
|       |    ├──types.ts
|       ├──utils/
|       |    ├──utils.ts
|       ├──App.tsx
|       ├──main.tsx
|       ├──index.css
│
├── server/             # Backend (Nodejs + Express) 
│   ├── data/
|   |    ├──db.schema.sql
|   |    ├──words.ts
│   ├── database/
|   |    ├──db.config.ts
│   ├── socket/
|   |    ├──helpers/
|   |    |    ├──fetchRoomState.ts
|   |    |    ├──generateRoomCode.ts
|   |    |    ├──generateWords.ts
|   |    |    ├──playerLeave.ts
|   |    |    ├──resolveGameResults.ts
|   |    ├──socket.ts
│   └── types/
|       ├──types.ts
├── server.ts
├── .env
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Faizan-313/find-spy.git
cd spy-game
```

### 2. Install dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

---

### 3. Setup Environment Variables

Create `.env` files inside the `backend` and `frontend` folders:

```env backend
PORT=
DB_URI=your_database_url
```

```env frontend
VITE_API_URL= //backend url
```

---

### 4. Run the Application

#### Start Backend:
```bash
cd backend
npm run dev
```

#### Start Frontend:
```bash
cd frontend
npm start
```

---

# Socket Events 

createRoom
error
joinRoom
startGame
startVoting
submitVote
roomUpdated
voteSubmitted
endVoting
restartGame
endGame
leaveRoom
disconnect

---

## How to Play

1. Create or join a game room using a code generated after creating room
2. Each player receives a secret word  
3. One player (spy) gets a different word  
4. Players discuss to find inconsistencies  
5. Vote to eliminate the suspected spy  
6. Spy wins if not detected, others win if spy is caught  

---

## Future Enhancements

- Voice chat integration (WebRTC)
- Improved mobile responsiveness
- Custom game modes

---

## Contributing

Contributions are welcome!

---

## License

This project is licensed under the MIT License.

---

## Author

**Peer Faizan**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
