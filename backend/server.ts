import express from "express"
import "dotenv/config"
import http from "http"
import { setUpSocket } from "./socket/socket"
import cors from "cors"
import dbPool from "./database/db.config"

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json())
app.use(express.static('public'));

await dbPool.connect();

setUpSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

