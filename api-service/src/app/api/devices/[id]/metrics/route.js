import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * @swagger
 * /api/devices/{id}/metrics:
 *   get:
 *     summary: Get timeseries metrics for a device
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the device
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Device metrics successfully retrieved
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // First, verify device exists
        const deviceResult = await query('SELECT * FROM devices WHERE id = $1', [id]);

        if (deviceResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
        }

        const deviceId = deviceResult.rows[0].id;

        // Get the query params for time range, limit, etc.
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);

        // Fetch timeseries data from TimescaleDB
        const metricsResult = await query(
            'SELECT * FROM device_metrics WHERE device_id = $1 ORDER BY time DESC LIMIT $2',
            [deviceId, limit]
        );

        return NextResponse.json({
            success: true,
            data: {
                device: deviceResult.rows[0],
                metrics: metricsResult.rows
            }
        });
    } catch (error) {
        console.error(`Error fetching metrics for device id ${params.id}:`, error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
