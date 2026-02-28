const mqtt = require('mqtt');

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1884';

// Connect to the EMQX broker
const client = mqtt.connect(brokerUrl, {
    username: 'admin',
    password: 'public'
});

client.on('connect', () => {
    console.log('Connected to EMQX broker. Starting to send simulated telemetry...');

    // Simulate 10 devices sending data every 5 seconds
    const devices = Array.from({ length: 10 }, (_, i) => `RMD-${1001 + i}`);

    setInterval(() => {
        devices.forEach((uid) => {
            const topic = `citynet/rmd/${uid}/telemetry`;

            let payload = {
                v: 1,
                temperature: +(20 + Math.random() * 10).toFixed(2), // float
                humidity: +(40 + Math.random() * 20).toFixed(2),    // float
                battery_voltage: +(11.0 + Math.random() * 1.5).toFixed(2), // float
                battery_capacity: Math.floor(80 + Math.random() * 20), // int
                ac_input: Math.random() > 0.5 ? 1.0 : 0.0, // float
                inverter_status: Math.random() > 0.5 ? 1 : 0, // int
                door1: 0, // int
                door2: 0, // int
                door3: 0, // int
                water_leak: 0, // int
                fire: 0, // int
                relay: 1, // int
                internet_status: true, // boolean
                mqtt_status: true // boolean
            };

            // For 3 specific devices, simulate varied/abnormal data for graphs
            if (['RMD-1008', 'RMD-1009', 'RMD-1010'].includes(uid)) {
                payload.temperature = +(55 + Math.random() * 20).toFixed(2); // High temp spike!
                payload.humidity = +(10 + Math.random() * 10).toFixed(2); // Very dry
                payload.battery_voltage = +(9.5 + Math.random() * 1.0).toFixed(2); // Low battery
                payload.battery_capacity = Math.floor(10 + Math.random() * 15); // Low capacity
                payload.door1 = 1; // Door is open
                payload.water_leak = uid === 'RMD-1009' ? 1 : 0;
                payload.fire = uid === 'RMD-1010' ? 1 : 0;
            }

            console.log(`Publishing to ${topic} -> Temp: ${payload.temperature}°C, Bat: ${payload.battery_voltage}V`);

            client.publish(topic, JSON.stringify(payload), { qos: 1 });
        });
    }, 5000); // Send every 5 seconds
});

client.on('error', (err) => {
    console.error('MQTT Error:', err);
    process.exit(1);
});
