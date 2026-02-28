require('dotenv').config();
const { pool } = require('./db');
const { client } = require('./mqtt');

console.log('[Worker] Starting CityNet MQTT Telemetry Worker...');

// Graceful shutdown
const shutdown = () => {
    console.log('[Worker] Shutting down gracefully...');
    client.end(true, () => {
        pool.end(() => {
            console.log('[Worker] Db connection pool closed.');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// The MQTT client is already connecting upon requiring it.
// The DB pool is ready for queries.
