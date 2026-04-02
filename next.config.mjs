/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output only when STANDALONE env var is set (for Docker builds)
  ...(process.env.STANDALONE === "true" && { output: "standalone" }),
};

export default nextConfig;
