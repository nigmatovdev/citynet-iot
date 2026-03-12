import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get global timeseries metrics for all devices
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 500
 *     responses:
 *       200:
 *         description: Global device metrics successfully retrieved
 *       500:
 *         description: Internal server error
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '500', 10);

        // Fetch recent timeseries data across all devices
        const metricsResult = await query(
            `SELECT m.id, m.device_id, m.temperature, m.humidity, m.battery_voltage, 
                    m.battery_capacity, m.created_at, d.name, d.uid 
             FROM device_metrics m
             JOIN devices d ON m.device_id = d.id
             ORDER BY m.created_at DESC 
             LIMIT $1`,
            [limit]
        );

        return NextResponse.json({
            success: true,
            data: metricsResult.rows
        });
    } catch (error) {
        console.error('Error fetching global metrics:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
