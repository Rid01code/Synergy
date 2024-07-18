/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

dotenv.config();
const nextConfig = {
  env: {
    PORT_URL: process.env.PORT_URL
  }
};

export default nextConfig;
