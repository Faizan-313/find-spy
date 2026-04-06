# Spy Game Web App

An interactive multiplayer web-based game where players try to identify the "spy" among them. Each player receives a secret word — except one player (the spy), who gets a different word. Players communicate, analyze responses, and vote to find the spy.

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
- MySQL 

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
|       |     ├──CreateRoom.tsx
|       |     ├──Home.tsx
|       |     ├──JoinRoom.tsx
|       |     ├──Room.tsx
|       ├──App.tsx
|       ├──main.tsx
|       ├──index.css
│
├── server/             # Backend (Nodejs + Express) 
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── sockets/
│
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

### 3. Setup Environment Variables  (For Future)

Create a `.env` file inside the `server` folder:

```env
PORT=5000
DB_URI=your_database_url
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
- AI-based anomaly detection
- Improved mobile responsiveness
- Custom game modes

---

## Contributing

Contributions are welcome!

1. Fork the repository  
2. Create your branch (`git checkout -b feature-name`)  
3. Commit your changes (`git commit -m "Added feature"`)  
4. Push to the branch (`git push origin feature-name`)  
5. Open a Pull Request  

---

## License

This project is licensed under the MIT License.

---

## Author

**Peer Faizan**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!