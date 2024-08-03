/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';

dotenv.config();
const nextConfig = {
  env: {
    PORT_URL: process.env.PORT_URL || process.env['APPSETTING_PORT_URL'],
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || process.env['APPSETTING_NEXT_PUBLIC_SOCKET_URL'],

  }
};

export default nextConfig;
