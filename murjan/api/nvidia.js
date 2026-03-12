/**
 * Vercel Serverless Function — NVIDIA API Proxy
 * Route: /api/nvidia  (maps to /v1/chat/completions on NVIDIA)
 *
 * Forwards requests to NVIDIA's API server-side to avoid CORS issues
 * and keep the API key out of browser network traffic.
 */

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const apiKey = process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'NVIDIA API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await req.text();

    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
        },
        body,
    });

    // Stream the response back to the client
    return new Response(nvidiaRes.body, {
        status: nvidiaRes.status,
        headers: {
            'Content-Type': nvidiaRes.headers.get('Content-Type') || 'text/event-stream',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
        },
    });
}
