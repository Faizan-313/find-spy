import { Pool } from 'pg'

const dbPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'find-spy',
    password: 'database@sql',
    port: 5432,
})

export default dbPool;