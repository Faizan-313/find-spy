import { Pool } from 'pg'

const dbPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
})

dbPool.on('connect', () =>{
    console.log("Connection pool established with database")
})

export default dbPool;