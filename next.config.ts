import type { NextConfig } from "next";

const LOCAL_IP = process.env.LOCAL_IP

const securityHeaders = [
    {
        key: "Content-Security-Policy-Report-Only",
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-src https://www.google.com https://www.recaptcha.net https://www.facebook.com https://www.gstatic.com",
            "connect-src 'self' https://betteriligancity.org https://api.cloudinary.com https://www.gstatic.com https://www.recaptcha.net https://www.google.com https://tiles.openfreemap.org",
            "frame-ancestors 'none'",
        ].join("; "),
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
    },
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
];


const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
    allowedDevOrigins: LOCAL_IP ? [LOCAL_IP] : [],

};

export default nextConfig;
