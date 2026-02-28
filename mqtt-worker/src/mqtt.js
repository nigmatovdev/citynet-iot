const mqtt = require('mqtt');
const { upsertDevice, insertMetric } = require('./db');
require('dotenv').config();

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const username = process.env.MQTT_USER || 'admin';
const password = process.env.MQTT_PASSWORD || 'public';

const client = mqtt.connect(brokerUrl, {
    username,
    password,
    clientId: `citynet_worker_${Math.random().toString(16).slice(3)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log(`[MQTT] Connected to broker at ${brokerUrl}`);
    // Subscribe to all device telemetry topics
    client.subscribe('citynet/rmd/+/telemetry', (err) => {
        if (!err) {
            console.log('[MQTT] Subscribed to citynet/rmd/+/telemetry');
        } else {
            console.error('[MQTT] Subscription error:', err);
        }
    });

    // Could also subscribe to status/events
});

client.on('message', async (topic, message) => {
    try {
        const payloadStr = message.toString();
        const payload = JSON.parse(payloadStr);

        // Extract uid from topic
        // Topic format: citynet/rmd/{uid}/telemetry
        const parts = topic.split('/');
        if (parts.length < 4) return;
        const uid = parts[2];

        // Upsert device to get its UUID and update last_seen
        const deviceId = await upsertDevice(uid);

        // Insert timeseries data
        await insertMetric(deviceId, payload);

        // TODO: Evaluate Alerts (Phase 6)
        // TODO: Publish to WebSocket/Redis for real-time (Phase 5)

    } catch (err) {
        console.error(`[MQTT] Error processing message on ${topic}:`, err.message);
    }
});

client.on('error', (err) => {
    console.error('[MQTT] Client error:', err);
});

client.on('offline', () => {
    console.log('[MQTT] Client went offline');
});

module.exports = { client };
