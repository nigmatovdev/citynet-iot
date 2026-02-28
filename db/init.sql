-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- admin, operator, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(100) UNIQUE NOT NULL, -- e.g. MAC address or MCU ID
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    firmware VARCHAR(50),
    hardware VARCHAR(50),
    status VARCHAR(50) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for devices
CREATE INDEX idx_devices_org ON devices(organization_id);
CREATE INDEX idx_devices_uid ON devices(uid);

-- Device Metrics (Hypertable)
CREATE TABLE IF NOT EXISTS device_metrics (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    battery_voltage DECIMAL(5,2),
    battery_capacity DECIMAL(5,2),
    ac_input BOOLEAN,
    inverter_status BOOLEAN,
    door1 BOOLEAN,
    door2 BOOLEAN,
    door3 BOOLEAN,
    water_leak BOOLEAN,
    fire BOOLEAN,
    relay BOOLEAN,
    internet_status BOOLEAN,
    mqtt_status BOOLEAN
);

-- Create TimescaleDB Hypertable
SELECT create_hypertable('device_metrics', 'time');

-- Index for efficient querying by device_id and time
CREATE INDEX idx_device_metrics_device_time ON device_metrics (device_id, time DESC);

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- e.g. 'battery_voltage'
    condition VARCHAR(10) NOT NULL,    -- '<', '>', '=', '!=', '<=', '>='
    threshold DECIMAL(10,2) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'warning', -- info, warning, critical
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts History
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_device ON alerts(device_id);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = FALSE;

-- Insert a default organization for CityNet
INSERT INTO organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'CityNet Admin') ON CONFLICT DO NOTHING;
