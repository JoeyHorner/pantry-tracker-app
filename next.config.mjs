//Source used to help fix issue with environment variables not loading: https://github.com/vercel/next.js/discussions/35257, post by 0xneves
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
        REACT_APP_AUTH_DOMAIN: process.env.REACT_APP_AUTH_DOMAIN,
        REACT_APP_PROJECT_ID: process.env.REACT_APP_PROJECT_ID,
        REACT_APP_STORAGE_BUCKET: process.env.REACT_APP_STORAGE_BUCKET,
        REACT_APP_MESSAGING_SENDER_ID: process.env.REACT_APP_MESSAGING_SENDER_ID,
        REACT_APP_APP_ID: process.env.REACT_APP_APP_ID,
        REACT_APP_OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY,

    }
};



export default nextConfig;
