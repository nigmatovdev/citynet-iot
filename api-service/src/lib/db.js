import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'citynet_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'citynet_iot',
    password: process.env.DB_PASSWORD || 'citynet_secret',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

/**
 * Utility function to query the database.
 * Usage: const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
 */
export const query = (text, params) => pool.query(text, params);

export default pool;
