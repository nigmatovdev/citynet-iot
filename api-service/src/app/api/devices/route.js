import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     description: Returns a list of all edge compute and sensor devices. Can be filtered by orgId.
 *     parameters:
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *         required: false
 *         description: The UUID of the organization
 *     responses:
 *       200:
 *         description: A list of devices.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('orgId'); // simplified tenant access for now

        let dbQuery = 'SELECT * FROM devices ORDER BY last_seen DESC';
        let params = [];

        if (orgId) {
            dbQuery = 'SELECT * FROM devices WHERE organization_id = $1 ORDER BY last_seen DESC';
            params.push(orgId);
        }

        const { rows } = await query(dbQuery, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching devices:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     description: Creates a new edge device and attaches it to an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *               name:
 *                 type: string
 *               organization_id:
 *                 type: string
 *                 format: uuid
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               firmware:
 *                 type: string
 *               hardware:
 *                 type: string
 *               status:
 *                 type: string
 *               last_seen:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Device created successfully.
 *       400:
 *         description: Missing required fields (uid).
 *       409:
 *         description: Device with this UID already exists.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { uid, name, organization_id, latitude, longitude, address, firmware, hardware, status, last_seen } = body;

        if (!uid) {
            return NextResponse.json({ success: false, error: 'UID is required' }, { status: 400 });
        }

        const orgIdToUse = organization_id || '00000000-0000-0000-0000-000000000000'; // Default org

        const dbQuery = `
            INSERT INTO devices (uid, name, organization_id, latitude, longitude, address, firmware, hardware, status, last_seen)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const params = [uid, name, orgIdToUse, latitude, longitude, address, firmware, hardware, status || 'offline', last_seen || null];

        const { rows } = await query(dbQuery, params);
        return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Error creating device:', error);
        if (error.code === '23505') { // unique violation
            return NextResponse.json({ success: false, error: 'Device with this UID already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
