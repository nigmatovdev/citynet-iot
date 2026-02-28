'use client';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
    return (
        <div className="container mx-auto mt-10 bg-white text-black min-h-screen p-4 rounded-lg shadow">
            <SwaggerUI url="/api/swagger" />
        </div>
    );
}
