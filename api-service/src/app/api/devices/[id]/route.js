import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Get a specific device by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the device
 *     responses:
 *       200:
 *         description: The device details
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const { rows } = await query('SELECT * FROM devices WHERE id = $1', [id]);
        if (rows.length === 0) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching device:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update an existing device
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       400:
 *         description: Invalid or missing fields
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const body = await request.json();

        // Allowed fields for update
        const allowedFields = ['name', 'latitude', 'longitude', 'address', 'firmware', 'hardware', 'status'];
        const updates = [];
        const values = [];
        let paramIndex = 1;

        for (const field of allowedFields) {
            // Check if the property exists in the body, even if it is an empty string
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                updates.push(`${field} = $${paramIndex}`);
                // Ensure status is safely stringified or mapped if it's sent differently
                let val = body[field];
                if (field === 'status' && typeof val === 'string') val = val.toLowerCase().trim();
                values.push(val);
                paramIndex++;
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
        }

        values.push(id); // for the WHERE id = $x clause
        const dbQuery = `
            UPDATE devices 
            SET ${updates.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING *
        `;

        const { rows } = await query(dbQuery, values);
        if (rows.length === 0) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating device:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete a device
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const { rowCount } = await query('DELETE FROM devices WHERE id = $1', [id]);
        if (rowCount === 0) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Device deleted successfully' });
    } catch (error) {
        console.error('Error deleting device:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
