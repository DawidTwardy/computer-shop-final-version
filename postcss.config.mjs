/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // W Server-Side Components (SSC) i Serverless Functions (API Routes)
    // te moduły powinny działać. Musimy je wykluczyć z budowania po stronie klienta.
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        module: false,
        path: false,
        stream: false,
        buffer: false,
        util: false,
        crypto: false,
        url: false,
        os: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        tty: false,
        constants: false,
        string_decoder: false,
        events: false,
        child_process: false,
        vm: false,
        'async_hooks': false,
        'diagnostics_channel': false,
        'worker_threads': false,
      };
    }

    return config;
  },
};

export default nextConfig;
