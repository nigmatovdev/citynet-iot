const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'citynet_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'citynet_iot',
  password: process.env.DB_PASSWORD || 'citynet_secret',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper to upsert a device
async function upsertDevice(uid) {
  const query = `
    INSERT INTO devices (uid, last_seen, status, organization_id)
    VALUES ($1, NOW(), 'online', '00000000-0000-0000-0000-000000000000')
    ON CONFLICT (uid) 
    DO UPDATE SET last_seen = NOW()
    RETURNING id;
  `;
  const result = await pool.query(query, [uid]);
  return result.rows[0].id;
}

// Helper to insert a metric
async function insertMetric(deviceId, payload) {
  const query = `
    INSERT INTO device_metrics (
      device_id, temperature, humidity, battery_voltage, battery_capacity,
      ac_input, inverter_status, door1, door2, door3, water_leak, fire, relay,
      internet_status, mqtt_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    );
  `;
  const values = [
    deviceId,
    payload.temperature || null,
    payload.humidity || null,
    payload.battery_voltage || null,
    payload.battery_capacity || null,
    payload.ac_input || null,
    payload.inverter_status || null,
    payload.door1 || null,
    payload.door2 || null,
    payload.door3 || null,
    payload.water_leak || null,
    payload.fire || null,
    payload.relay || null,
    payload.internet_status || null,
    payload.mqtt_status || null,
  ];
  await pool.query(query, values);
}

module.exports = {
  pool,
  upsertDevice,
  insertMetric
};
