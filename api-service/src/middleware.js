import { NextResponse } from 'next/server';
import * as jose from 'jose';

// We use `jose` instead of `jsonwebtoken` because Next.js Edge runtime does not support native Node.js crypto used by jsonwebtoken.
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_citynet_key_change_me_in_prod';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request) {
    // ONLY FOR TESTING - AUTH DISABLED
    // To re-enable auth, bring back the commented out block below
    /*
    if (request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/auth')) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        try {
            const { payload } = await jose.jwtVerify(token, secret);
            // Set headers for downstream routes
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.id);
            requestHeaders.set('x-org-id', payload.orgId);
            requestHeaders.set('x-user-role', payload.role);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('JWT verification failed:', error);
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }
    }
    */
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
