import express from "express"
import "dotenv/config"
import http from "http"
import { Server } from "socket.io";
import cors from "cors"

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

app.use(cors())
app.use(express.static('public'))


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})