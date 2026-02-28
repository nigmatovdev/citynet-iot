const mqtt = require('mqtt');

// Connect to the EMQX broker on port 1884
const client = mqtt.connect('mqtt://localhost:1884', {
    username: 'admin',
    password: 'public'
});

client.on('connect', () => {
    console.log('Connected to EMQX broker. Starting to send simulated telemetry...');

    // Simulate 3 devices sending data every 5 seconds
    const devices = ['RMD-1001', 'RMD-1002', 'RMD-1003'];

    setInterval(() => {
        devices.forEach((uid) => {
            const topic = `citynet/rmd/${uid}/telemetry`;

            const payload = {
                v: 1,
                temperature: +(20 + Math.random() * 10).toFixed(2), // 20.00 to 30.00
                humidity: +(40 + Math.random() * 20).toFixed(2),    // 40.00 to 60.00
                battery_voltage: +(11.0 + Math.random() * 1.5).toFixed(2), // 11.0 to 12.5
                battery_capacity: Math.floor(80 + Math.random() * 20), // 80 to 100
                ac_input: true,
                inverter_status: true,
                door1: false,
                door2: false,
                door3: false,
                water_leak: false,
                fire: false,
                relay: true,
                internet_status: true,
                mqtt_status: true
            };

            console.log(`Publishing to ${topic} -> Temp: ${payload.temperature}°C, Bat: ${payload.battery_voltage}V`);

            client.publish(topic, JSON.stringify(payload), { qos: 1 });
        });
    }, 5000); // Send every 5 seconds
});

client.on('error', (err) => {
    console.error('MQTT Error:', err);
    process.exit(1);
});
