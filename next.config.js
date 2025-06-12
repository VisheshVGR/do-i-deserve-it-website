// Use CommonJS syntax for next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  cacheOnFrontEndNav:true, 
  reloadOnOnline: true,
  register: true,
  skipWaiting: true,
  disable: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA({
  ...nextConfig,
});
