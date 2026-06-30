# Spy Game Web App

An interactive multiplayer web-based game where players try to identify the "spy" among them. Each player receives same word — except one player (the spy), who gets a different word. Players communicate, analyze responses, and vote to find the spy.

---

## Features

- Multiplayer game rooms
- Random word assignment (with one spy)
- Real-time discussion (chat-based)  
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

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Faizan-313/find-spy.git
cd find-spy
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
gameEnded
leaveRoom
sendMessage
chatMessage
typing
userTyping
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

## Contributing

Contributions are welcome!

---

## License

This project is licensed under the MIT License.

---

## Author

**Peer Faizan**

---

## Support

If you like this project, give it a Star on GitHub!
